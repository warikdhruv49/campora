import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Parents / Allowance', color: '#00d492', icon: 'Users' },
  { name: 'Scholarship', color: '#22d3ee', icon: 'GraduationCap' },
  { name: 'Internship', color: '#4d8dff', icon: 'Briefcase' },
  { name: 'Part-Time Job', color: '#5eead4', icon: 'Clock' },
  { name: 'Freelancing', color: '#a06bfa', icon: 'Laptop' },
  { name: 'Investments', color: '#c084fc', icon: 'TrendingUp' },
  { name: 'Refund', color: '#38bdf8', icon: 'Undo2' },
  { name: 'Gift', color: '#f5a623', icon: 'Gift' },
  { name: 'Other Income', color: '#8b95a5', icon: 'CircleDollarSign' },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food', color: '#ff8a4c', icon: 'Utensils' },
  { name: 'College Fees', color: '#4d8dff', icon: 'School' },
  { name: 'Books', color: '#5eead4', icon: 'BookOpen' },
  { name: 'Courses', color: '#22d3ee', icon: 'Library' },
  { name: 'Hostel', color: '#a06bfa', icon: 'BedDouble' },
  { name: 'Rent', color: '#c084fc', icon: 'Home' },
  { name: 'Transport', color: '#38bdf8', icon: 'Bus' },
  { name: 'Fuel', color: '#f97316', icon: 'Fuel' },
  { name: 'Shopping', color: '#f65e7a', icon: 'ShoppingBag' },
  { name: 'Entertainment', color: '#e879f9', icon: 'Clapperboard' },
  { name: 'Gaming', color: '#818cf8', icon: 'Gamepad2' },
  { name: 'Subscriptions', color: '#f5a623', icon: 'Repeat' },
  { name: 'Mobile Recharge', color: '#fb7185', icon: 'Smartphone' },
  { name: 'Internet', color: '#60a5fa', icon: 'Wifi' },
  { name: 'Healthcare', color: '#ff5b66', icon: 'HeartPulse' },
  { name: 'Travel', color: '#2dd4bf', icon: 'Plane' },
  { name: 'Other Expense', color: '#8b95a5', icon: 'Receipt' },
];

export async function seedDefaultCategories(userId) {
  const income = DEFAULT_INCOME_CATEGORIES.map((c) => ({ ...c, type: 'INCOME', userId, isDefault: true }));
  const expense = DEFAULT_EXPENSE_CATEGORIES.map((c) => ({ ...c, type: 'EXPENSE', userId, isDefault: true }));
  await prisma.category.createMany({ data: [...income, ...expense] });
}export async function listCategories(userId) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { transactions: true } } },
  }).then((rows) => rows.map(({ _count, ...rest }) => ({ ...rest, transactionCount: _count.transactions })));
}

export async function createCategory(userId, data) {
  const existing = await prisma.category.findFirst({ where: { userId, name: data.name, type: data.type } });
  if (existing) throw ApiError.conflict(`Category "${data.name}" already exists for this type`);
  return prisma.category.create({ data: { ...data, userId } });
}

export async function updateCategory(userId, id, data) {
  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) throw ApiError.notFound('Category not found');

  if (data.name || data.type) {
    const name = data.name ?? category.name;
    const type = data.type ?? category.type;
    const clash = await prisma.category.findFirst({
      where: { userId, name, type, id: { not: id } },
    });
    if (clash) throw ApiError.conflict(`Category "${name}" already exists for this type`);
  }
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(userId, id) {
  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) throw ApiError.notFound('Category not found');
  await prisma.category.delete({ where: { id } });
}
