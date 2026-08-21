import { prisma } from '../config/prisma.js';
import { listAccounts } from './account.service.js';
import { round2, toNum } from '../utils/money.js';

export async function getMonthlyFlow(userId, months = 12) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      type: { in: ['INCOME', 'EXPENSE'] },
      transactionDate: { gte: start },
    },
    select: { type: true, amount: true, transactionDate: true },
  });

  const buckets = new Map();
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.set(key, { month: key, income: 0, expenses: 0 });
  }

  for (const row of rows) {
    const d = row.transactionDate;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (row.type === 'INCOME') bucket.income += toNum(row.amount);
    else bucket.expenses += toNum(row.amount);
  }

  return [...buckets.values()].map((b) => ({
    ...b,
    income: round2(b.income),
    expenses: round2(b.expenses),
    savings: round2(b.income - b.expenses),
  }));
}

export async function getSpendingByCategory(userId, { from, to }) {
  const where = {
    userId,
    status: 'COMPLETED',
    type: 'EXPENSE',
    ...(from || to ? { transactionDate: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
  };

  const grouped = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where,
    _sum: { amount: true },
    _count: { _all: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  const categoryIds = grouped.map((g) => g.categoryId).filter(Boolean);
  const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  const byId = new Map(categories.map((c) => [c.id, c]));

  const items = grouped
    .filter((g) => g.categoryId)
    .map((g) => {
      const category = byId.get(g.categoryId);
      return {
        categoryId: g.categoryId,
        name: category?.name || 'Uncategorized',
        color: category?.color || '#8b95a5',
        total: toNum(g._sum.amount),
        count: g._count._all,
      };
    });

  const total = round2(items.reduce((s, i) => s + i.total, 0));
  return {
    total,
    items: items.map((i) => ({ ...i, pct: total > 0 ? round2((i.total / total) * 100) : 0 })),
  };
}

export async function getAccountDistribution(userId) {
  const accounts = (await listAccounts(userId)).filter((a) => a.isActive);
  const assets = accounts.filter((a) => a.type !== 'CREDIT_CARD');
  const liabilities = accounts.filter((a) => a.type === 'CREDIT_CARD');

  const assetTotal = round2(assets.reduce((s, a) => s + a.balance, 0));
  const liabilityTotal = round2(liabilities.reduce((s, a) => s + a.balance, 0));

  return {
    assetTotal,
    liabilityTotal,
    netWorth: round2(assetTotal - liabilityTotal),
    accounts: [...assets, ...liabilities].map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      color: a.color,
      balance: a.balance,
      pct: assetTotal > 0 && a.balance >= 0 ? round2((a.balance / assetTotal) * 100) : 0,
    })),
  };
}

export async function getCashFlowHistory(userId, months = 12) {
  const flow = await getMonthlyFlow(userId, months);
  return flow.map((m) => ({ month: m.month, cashFlow: m.savings }));
}

export async function getTopExpenses(userId, limit = 5) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const rows = await prisma.transaction.findMany({
    where: { userId, status: 'COMPLETED', type: 'EXPENSE', transactionDate: { gte: monthStart } },
    include: {
      category: { select: { name: true, color: true } },
      account: { select: { name: true, color: true } },
    },
    orderBy: { amount: 'desc' },
    take: limit,
  });
  return rows.map((r) => ({ ...r, amount: toNum(r.amount) }));
}

export async function getInsights(userId) {
  const now = new Date();
  const thisStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      type: { in: ['INCOME', 'EXPENSE'] },
      transactionDate: { gte: lastStart },
    },
    select: { type: true, amount: true, categoryId: true, transactionDate: true },
  });

  const sumType = (list, type) =>
    round2(list.filter((r) => r.type === type).reduce((s, r) => s + toNum(r.amount), 0));

  const current = rows.filter((r) => r.transactionDate >= thisStart);
  const previous = rows.filter((r) => r.transactionDate < thisStart);

  const incomeNow = sumType(current, 'INCOME');
  const incomePrev = sumType(previous, 'INCOME');
  const spendNow = sumType(current, 'EXPENSE');
  const spendPrev = sumType(previous, 'EXPENSE');
  const rateNow = incomeNow > 0 ? round2(((incomeNow - spendNow) / incomeNow) * 100) : null;
  const ratePrev = incomePrev > 0 ? round2(((incomePrev - spendPrev) / incomePrev) * 100) : null;

  const insights = [];

  if (rateNow !== null && ratePrev !== null && rateNow !== ratePrev) {
    const improved = rateNow > ratePrev;
    insights.push({
      tone: improved ? 'positive' : 'negative',
      text: `Your savings rate ${improved ? 'improved' : 'dropped'} from ${Math.abs(ratePrev).toFixed(0)}% to ${Math.abs(rateNow).toFixed(0)}%.`,
    });
  }

  if (spendPrev > 0 && spendNow > 0) {
    const diffPct = Math.round(((spendNow - spendPrev) / spendPrev) * 100);
    if (Math.abs(diffPct) >= 5) {
      insights.push({
        tone: diffPct > 0 ? 'negative' : 'positive',
        text: `Total spending is ${diffPct > 0 ? 'up' : 'down'} ${Math.abs(diffPct)}% vs last month.`,
      });
    }
  }

  const catTotals = (list) => {
    const map = new Map();
    for (const r of list) {
      if (r.type !== 'EXPENSE' || !r.categoryId) continue;
      map.set(r.categoryId, round2((map.get(r.categoryId) || 0) + toNum(r.amount)));
    }
    return map;
  };
  const nowCats = catTotals(current);
  const prevCats = catTotals(previous);
  const categoryIds = [...new Set([...nowCats.keys(), ...prevCats.keys()])];
  const categories = categoryIds.length
    ? await prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } })
    : [];
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  const changes = categoryIds
    .map((id) => ({
      id,
      name: nameById.get(id) || 'Uncategorized',
      now: nowCats.get(id) || 0,
      prev: prevCats.get(id) || 0,
    }))
    .filter((c) => c.prev > 0 && c.now > 0)
    .map((c) => ({ ...c, pct: Math.round(((c.now - c.prev) / c.prev) * 100) }))
    .filter((c) => Math.abs(c.pct) >= 10)
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, 3);

  for (const change of changes) {
    insights.push({
      tone: change.pct > 0 ? 'negative' : 'positive',
      text: `${change.name} spending ${change.pct > 0 ? 'increased' : 'decreased'} ${Math.abs(change.pct)}% this month.`,
    });
  }

  if (prevCats.size > 0 || nowCats.size > 0) {
    let top = null;
    for (const [id, amount] of nowCats.entries()) {
      if (!top || amount > top.amount) top = { id, amount };
    }
    if (top && top.amount > 0) {
      insights.push({
        tone: 'neutral',
        text: `${nameById.get(top.id) || 'One category'} is your largest expense so far this month at ₹${top.amount.toLocaleString('en-IN')}.`,
      });
    }
  }

  if (!insights.length) {
    insights.push({ tone: 'neutral', text: 'Record a few more transactions to unlock personalized insights.' });
  }

  return insights.slice(0, 6);
}
