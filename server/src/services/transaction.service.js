import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPaginationMeta, getPagination, parseDateRange } from '../utils/pagination.js';
import { dayKey, hourKey, round2, toDecimal, toNum } from '../utils/money.js';

const listInclude = {
  account: { select: { id: true, name: true, type: true, color: true } },
  transferAccount: { select: { id: true, name: true, type: true, color: true } },
  category: { select: { id: true, name: true, color: true } },
};

async function assertOwnedAccount(userId, accountId, field) {
  const account = await prisma.account.findFirst({ where: { id: accountId, userId }, select: { id: true } });
  if (!account) throw ApiError.badRequest(`Invalid ${field}`);
}

async function assertOwnedCategory(userId, categoryId) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId }, select: { id: true } });
  if (!category) throw ApiError.badRequest('Invalid category');
}

export async function listTransactions(userId, query) {
  const { page, limit, skip, take } = getPagination(query);
  const where = { userId };

  if (query.search) {
    where.OR = [
      { merchant: { contains: query.search } },
      { description: { contains: query.search } },
      { reference: { contains: query.search } },
    ];
  }
  if (query.type) where.type = query.type;
  if (query.status) where.status = query.status;
  if (query.categoryId) where.categoryId = query.categoryId;

  if (query.accountId) {
    const accountCondition = { OR: [{ accountId: query.accountId }, { transferAccountId: query.accountId }] };
    if (where.OR) {
      where.AND = [{ OR: where.OR }, accountCondition];
      delete where.OR;
    } else {
      where.OR = accountCondition.OR;
    }
  }

  const dateRange = parseDateRange(query);
  if (dateRange) where.transactionDate = dateRange;

  if (query.minAmount !== undefined || query.maxAmount !== undefined) {
    where.amount = {
      ...(query.minAmount !== undefined ? { gte: query.minAmount } : {}),
      ...(query.maxAmount !== undefined ? { lte: query.maxAmount } : {}),
    };
  }

  const orderBy = [{ [query.sortBy]: query.sortOrder }, { id: 'desc' }];

  const [total, rows] = await prisma.$transaction([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: listInclude,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    items: rows.map(serializeTransaction),
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

export async function getTransaction(userId, id) {
  const txn = await prisma.transaction.findFirst({ where: { id, userId }, include: listInclude });
  if (!txn) throw ApiError.notFound('Transaction not found');
  return serializeTransaction(txn);
}

export async function createTransaction(userId, data) {
  await assertOwnedAccount(userId, data.accountId, 'account');
  if (data.transferAccountId) await assertOwnedAccount(userId, data.transferAccountId, 'destination account');
  if (data.categoryId) await assertOwnedCategory(userId, data.categoryId);

  const created = await prisma.$transaction(async (tx) => {
    const txn = await tx.transaction.create({ data: { ...data, userId, amount: toDecimal(data.amount) } });
    if (txn.status === 'COMPLETED') await applyBalanceEffects(tx, txn);
    return txn;
  });

  return getTransaction(userId, created.id);
}

export async function updateTransaction(userId, id, data) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw ApiError.notFound('Transaction not found');

  const nextAccountId = data.accountId ?? existing.accountId;
  await assertOwnedAccount(userId, nextAccountId, 'account');

  const nextTransferAccountId =
    'transferAccountId' in data ? data.transferAccountId : existing.transferAccountId;
  if (nextTransferAccountId) await assertOwnedAccount(userId, nextTransferAccountId, 'destination account');

  const nextCategoryId = 'categoryId' in data ? data.categoryId : existing.categoryId;
  if (nextCategoryId) await assertOwnedCategory(userId, nextCategoryId);

  await prisma.$transaction(async (tx) => {
    if (existing.status === 'COMPLETED') await revertBalanceEffects(tx, existing);
    const updated = await tx.transaction.update({
      where: { id },
      data: {
        ...data,
        ...(data.amount !== undefined ? { amount: toDecimal(data.amount) } : {}),
      },
    });
    if (updated.status === 'COMPLETED') await applyBalanceEffects(tx, updated);
    return updated;
  });

  return getTransaction(userId, id);
}

export async function deleteTransaction(userId, id) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw ApiError.notFound('Transaction not found');

  await prisma.$transaction(async (tx) => {
    if (existing.status === 'COMPLETED') await revertBalanceEffects(tx, existing);
    await tx.transaction.delete({ where: { id } });
  });
}

async function applyBalanceEffects(tx, txn) {
  const amount = toDecimal(txn.amount);
  if (txn.type === 'INCOME') {
    await tx.account.update({ where: { id: txn.accountId }, data: { balance: { increment: amount } } });
  } else if (txn.type === 'EXPENSE') {
    await tx.account.update({ where: { id: txn.accountId }, data: { balance: { decrement: amount } } });
  } else if (txn.type === 'TRANSFER' && txn.transferAccountId) {
    await tx.account.update({ where: { id: txn.accountId }, data: { balance: { decrement: amount } } });
    await tx.account.update({ where: { id: txn.transferAccountId }, data: { balance: { increment: amount } } });
  }
}

async function revertBalanceEffects(tx, txn) {
  const amount = toDecimal(txn.amount);
  if (txn.type === 'INCOME') {
    await tx.account.update({ where: { id: txn.accountId }, data: { balance: { decrement: amount } } });
  } else if (txn.type === 'EXPENSE') {
    await tx.account.update({ where: { id: txn.accountId }, data: { balance: { increment: amount } } });
  } else if (txn.type === 'TRANSFER' && txn.transferAccountId) {
    await tx.account.update({ where: { id: txn.accountId }, data: { balance: { increment: amount } } });
    await tx.account.update({ where: { id: txn.transferAccountId }, data: { balance: { decrement: amount } } });
  }
}

function serializeTransaction(txn) {
  return {
    ...txn,
    amount: toNum(txn.amount),
  };
}

export async function recentTransactions(userId, limit = 8) {
  const rows = await prisma.transaction.findMany({
    where: { userId },
    include: listInclude,
    orderBy: [{ transactionDate: 'desc' }, { id: 'desc' }],
    take: limit,
  });
  return rows.map(serializeTransaction);
}

export async function globalSearch(userId, term) {
  const q = term.trim();
  if (!q) return { transactions: [], accounts: [], categories: [] };

  const [transactions, accounts, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        OR: [
          { merchant: { contains: q } },
          { description: { contains: q } },
          { reference: { contains: q } },
        ],
      },
      include: listInclude,
      orderBy: { transactionDate: 'desc' },
      take: 6,
    }),
    prisma.account.findMany({
      where: { userId, OR: [{ name: { contains: q } }, { institution: { contains: q } }] },
      take: 4,
    }),
    prisma.category.findMany({
      where: { userId, name: { contains: q } },
      take: 4,
    }),
  ]);

  return {
    transactions: transactions.map(serializeTransaction),
    accounts: accounts.map((a) => ({ ...a, balance: toNum(a.balance) })),
    categories,
  };
}

export async function buildNetWorthTimeline(userId, days) {
  const granularity = days <= 1 ? 'hour' : 'day';
  const now = new Date();
  const start = new Date(now);
  if (granularity === 'hour') start.setHours(start.getHours() - 23, 0, 0, 0);
  else start.setDate(start.getDate() - (days - 1)), start.setHours(0, 0, 0, 0);

  const [accounts, txns] = await Promise.all([
    prisma.account.findMany({ where: { userId, isActive: true }, select: { type: true, balance: true } }),
    prisma.transaction.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        type: { in: ['INCOME', 'EXPENSE'] },
        transactionDate: { gte: start },
      },
      select: { type: true, amount: true, transactionDate: true },
    }),
  ]);

  let currentTotal = 0;
  for (const account of accounts) {
    currentTotal += account.type === 'CREDIT_CARD' ? -toNum(account.balance) : toNum(account.balance);
  }
  currentTotal = round2(currentTotal);

  const deltas = new Map();
  for (const txn of txns) {
    const key = granularity === 'hour' ? hourKey(txn.transactionDate) : dayKey(txn.transactionDate);
    const signed = txn.type === 'INCOME' ? toNum(txn.amount) : -toNum(txn.amount);
    deltas.set(key, round2((deltas.get(key) || 0) + signed));
  }

  const points = [];
  const keys = [];
  if (granularity === 'hour') {
    for (let i = 23; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setHours(d.getHours() - i, 0, 0, 0);
      keys.push(hourKey(d));
    }
  } else {
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      keys.push(dayKey(d));
    }
  }

  let runningAfter = 0;
  const valuesByKey = new Map();
  for (let i = keys.length - 1; i >= 0; i -= 1) {
    valuesByKey.set(keys[i], round2(currentTotal - runningAfter));
    runningAfter = round2(runningAfter + (deltas.get(keys[i]) || 0));
  }

  for (const key of keys) points.push({ time: key, value: valuesByKey.get(key) });

  const firstDelta = deltas.get(keys[0]) || 0;
  points.unshift({
    time: granularity === 'hour' ? shiftHour(keys[0], -1) : shiftDay(keys[0], -1),
    value: round2(valuesByKey.get(keys[0]) - firstDelta),
  });

  return { points, currentTotal };
}

const shiftDay = (key, delta) => {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return dayKey(d);
};

const shiftHour = (key, delta) => {
  const d = new Date(key);
  d.setHours(d.getHours() + delta);
  return hourKey(d);
};

export async function monthTypeSums(userId, from, to) {
  const grouped = await prisma.transaction.groupBy({
    by: ['type'],
    where: { userId, status: 'COMPLETED', type: { in: ['INCOME', 'EXPENSE'] }, transactionDate: { gte: from, lt: to } },
    _sum: { amount: true },
  });
  const result = { INCOME: 0, EXPENSE: 0 };
  for (const row of grouped) result[row.type] = toNum(row._sum.amount);
  return result;
}
