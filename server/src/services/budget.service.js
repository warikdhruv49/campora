import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { round2, toDecimal, toNum } from '../utils/money.js';

export async function getBudgetOverview(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { monthlyBudget: true, currency: true },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);

  const [categorySums, budgets] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        status: 'COMPLETED',
        type: 'EXPENSE',
        transactionDate: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
    prisma.budget.findMany({
      where: { userId },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const spentByCategory = new Map();
  let totalSpent = 0;
  for (const row of categorySums) {
    const amount = toNum(row._sum.amount);
    if (row.categoryId) spentByCategory.set(row.categoryId, amount);
    totalSpent += amount;
  }
  totalSpent = round2(totalSpent);

  const overallBudget = toNum(user?.monthlyBudget);
  const overallRemaining = round2(Math.max(0, overallBudget - totalSpent));
  const dailyLimit = overallBudget > 0 ? round2(overallRemaining / daysLeft) : null;

  return {
    currency: user?.currency || 'INR',
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    overall: {
      budget: overallBudget,
      spent: totalSpent,
      remaining: overallRemaining,
      pct: overallBudget > 0 ? Math.min(100, round2((totalSpent / overallBudget) * 100)) : 0,
      daysLeft,
      dailyLimit,
      overspent: overallBudget > 0 && totalSpent > overallBudget,
    },
    categories: budgets.map((b) => {
      const amount = toNum(b.amount);
      const spent = round2(spentByCategory.get(b.categoryId) || 0);
      const pct = amount > 0 ? Math.min(100, round2((spent / amount) * 100)) : 0;
      return {
        id: b.id,
        categoryId: b.categoryId,
        category: b.category,
        amount,
        spent,
        remaining: round2(amount - spent),
        pct,
        overspent: spent > amount,
        warning: !!(amount > 0 && pct >= 75 && pct <= 100),
      };
    }),
  };
}

export async function setOverallBudget(userId, amount) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { monthlyBudget: amount === 0 ? null : toDecimal(amount) },
    select: { monthlyBudget: true },
  });
  return { monthlyBudget: toNum(user.monthlyBudget) };
}

export async function upsertCategoryBudget(userId, categoryId, amount) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw ApiError.badRequest('Invalid category');
  if (category.type !== 'EXPENSE') throw ApiError.badRequest('Budgets apply to expense categories only');

  const existing = await prisma.budget.findUnique({ where: { categoryId } });
  const budget = await prisma.budget.upsert({
    where: { categoryId },
    update: { amount: toDecimal(amount) },
    create: { userId, categoryId, amount: toDecimal(amount) },
  });
  return { ...budget, amount: toNum(budget.amount), created: !existing };
}

export async function updateCategoryBudget(userId, id, amount) {
  const budget = await prisma.budget.findFirst({ where: { id, userId } });
  if (!budget) throw ApiError.notFound('Budget not found');
  const updated = await prisma.budget.update({ where: { id }, data: { amount: toDecimal(amount) } });
  return { ...updated, amount: toNum(updated.amount) };
}

export async function deleteCategoryBudget(userId, id) {
  const budget = await prisma.budget.findFirst({ where: { id, userId } });
  if (!budget) throw ApiError.notFound('Budget not found');
  await prisma.budget.delete({ where: { id } });
}
