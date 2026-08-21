import { prisma } from '../config/prisma.js';
import { LIQUID_TYPES, computeNetWorth, listAccounts } from './account.service.js';
import { buildNetWorthTimeline, monthTypeSums, recentTransactions } from './transaction.service.js';
import { pctChange, round2, toNum } from '../utils/money.js';
import { getBudgetOverview } from './budget.service.js';
import { upcomingPayments } from './recurring.service.js';

const RANGE_DAYS = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 182, '1Y': 365 };

export async function getDashboardSummary(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const monthWhere = {
    userId,
    status: 'COMPLETED',
    transactionDate: { gte: startOfMonth, lt: startOfNextMonth },
  };

  const [netWorthAgg, incomeAgg, expenseAgg, recent] = await Promise.all([
    prisma.account.aggregate({
      where: { userId },
      _sum: { balance: true },
    }),
    prisma.transaction.aggregate({
      where: { ...monthWhere, type: 'INCOME' },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { ...monthWhere, type: 'EXPENSE' },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ transactionDate: 'desc' }, { id: 'desc' }],
      take: 5,
      select: {
        id: true,
        type: true,
        amount: true,
        currency: true,
        merchant: true,
        description: true,
        status: true,
        transactionDate: true,
        account: { select: { id: true, name: true, type: true } },
        category: { select: { id: true, name: true } },
      },
    }),
  ]);

  const monthlyIncome = round2(toNum(incomeAgg._sum.amount));
  const monthlyExpenses = round2(toNum(expenseAgg._sum.amount));

  return {
    totalNetWorth: round2(toNum(netWorthAgg._sum.balance)),
    monthlyIncome,
    monthlyExpenses,
    monthlyCashFlow: round2(monthlyIncome - monthlyExpenses),
    recentTransactions: recent.map((txn) => ({ ...txn, amount: toNum(txn.amount) })),
  };
}

export async function getSummary(userId) {
  const accounts = await listAccounts(userId);
  const { assets, liabilities, netWorth } = computeNetWorth(accounts);

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [current, previous] = await Promise.all([
    monthTypeSums(userId, thisMonth, nextMonth),
    monthTypeSums(userId, prevMonth, thisMonth),
  ]);

  const cashFlow = round2(current.INCOME - current.EXPENSE);
  const savingsRate = current.INCOME > 0 ? round2((cashFlow / current.INCOME) * 100) : 0;
  const availableCash = round2(
    accounts
      .filter((a) => a.isActive && LIQUID_TYPES.includes(a.type))
      .reduce((sum, a) => sum + a.balance, 0)
  );

  const timeline = await buildNetWorthTimeline(userId, 30);
  const monthAgo = timeline.points[0]?.value ?? netWorth;
  const netChange = round2(netWorth - monthAgo);

  return {
    netWorth,
    totalAssets: assets,
    totalLiabilities: liabilities,
    netWorthChange: netChange,
    netWorthChangePct: pctChange(netWorth, monthAgo),
    monthlyIncome: current.INCOME,
    prevMonthIncome: previous.INCOME,
    incomeChangePct: pctChange(current.INCOME, previous.INCOME),
    monthlyExpenses: current.EXPENSE,
    prevMonthExpenses: previous.EXPENSE,
    expenseChangePct: pctChange(current.EXPENSE, previous.EXPENSE),
    cashFlow,
    savingsRate,
    availableCash,
    accountCount: accounts.filter((a) => a.isActive).length,
    transactionCount: await prisma.transaction.count({ where: { userId } }),
  };
}

export async function getDashboard(userId, range = '1M') {
  const days = RANGE_DAYS[range] || 30;
  const [summary, timeline, accounts, recent, budget, upcoming, topGoal] = await Promise.all([
    getSummary(userId),
    buildNetWorthTimeline(userId, days),
    listAccounts(userId),
    recentTransactions(userId, 8),
    getBudgetOverview(userId),
    upcomingPayments(userId, 14).catch(() => []),
    prisma.savingsGoal.findFirst({
      where: { userId, isArchived: false },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    summary,
    timeline: timeline.points,
    accounts: accounts.slice(0, 8).map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      color: account.color,
      institution: account.institution,
      balance: account.balance,
      currency: account.currency,
      isActive: account.isActive,
      sharePct:
        summary.totalAssets > 0 && account.balance >= 0
          ? round2((account.balance / summary.totalAssets) * 100)
          : 0,
    })),
    recentTransactions: recent,
    budget: {
      overall: budget.overall,
      categories: budget.categories.slice(0, 4),
    },
    upcomingPayments: upcoming.map((u) => ({
      id: u.id,
      merchant: u.merchant || u.category?.name || u.description || 'Recurring payment',
      amount: u.amount,
      type: u.type,
      nextDate: u.nextDate,
      dueInDays: u.dueInDays,
      color: u.category?.color || '#8b95a5',
    })),
    savingsGoal: topGoal
      ? {
          id: topGoal.id,
          name: topGoal.name,
          targetAmount: toNum(topGoal.targetAmount),
          savedAmount: toNum(topGoal.savedAmount),
          pct:
            toNum(topGoal.targetAmount) > 0
              ? Math.min(100, round2((toNum(topGoal.savedAmount) / toNum(topGoal.targetAmount)) * 100))
              : 0,
          color: topGoal.color,
        }
      : null,
  };
}

export async function getHealth(userId) {
  const months = 6;
  const now = new Date();
  const windowStart = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      type: { in: ['INCOME', 'EXPENSE'] },
      transactionDate: { gte: windowStart },
    },
    select: { type: true, amount: true, categoryId: true, transactionDate: true },
  });

  const monthly = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    monthly.push({
      key: `${now.getFullYear()}-${String(now.getMonth() - i + 12).padStart(2, '0')}`,
      income: 0,
      expenses: 0,
    });
  }

  for (const row of rows) {
    const d = row.transactionDate;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = monthly.find((m) => m.key === key);
    if (!bucket) continue;
    if (row.type === 'INCOME') bucket.income += toNum(row.amount);
    else bucket.expenses += toNum(row.amount);
  }
  monthly.forEach((m) => {
    m.income = round2(m.income);
    m.expenses = round2(m.expenses);
    m.savings = round2(m.income - m.expenses);
  });

  const activeMonths = monthly.filter((m) => m.income > 0 || m.expenses > 0).length || 1;
  const avgIncome = round2(monthly.reduce((s, m) => s + m.income, 0) / activeMonths);
  const avgSpending = round2(monthly.reduce((s, m) => s + m.expenses, 0) / activeMonths);

  const topCategory = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      status: 'COMPLETED',
      type: 'EXPENSE',
      transactionDate: { gte: new Date(now.getFullYear(), now.getMonth() - 2, 1) },
      categoryId: { not: null },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 1,
  });

  let largestExpenseCategory = null;
  if (topCategory.length && topCategory[0].categoryId) {
    const category = await prisma.category.findUnique({ where: { id: topCategory[0].categoryId } });
    if (category) {
      largestExpenseCategory = { name: category.name, color: category.color, amount: toNum(topCategory[0]._sum.amount) };
    }
  }

  const accounts = await listAccounts(userId);
  const availableCash = round2(
    accounts.filter((a) => a.isActive && LIQUID_TYPES.includes(a.type)).reduce((s, a) => s + a.balance, 0)
  );

  return {
    savingsRate: avgIncome > 0 ? round2(((avgIncome - avgSpending) / avgIncome) * 100) : 0,
    avgMonthlyIncome: avgIncome,
    avgMonthlySpending: avgSpending,
    emergencyCash: availableCash,
    runwayMonths: avgSpending > 0 ? round2(availableCash / avgSpending) : null,
    largestExpenseCategory,
    monthlyHistory: monthly.map(({ key, ...rest }) => ({ month: key, ...rest })),
  };
}
