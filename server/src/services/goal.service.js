import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { round2, toDecimal, toNum } from '../utils/money.js';

export async function listGoals(userId, { includeArchived = false } = {}) {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId, ...(includeArchived ? {} : { isArchived: false }) },
    orderBy: [{ isArchived: 'asc' }, { createdAt: 'desc' }],
  });
  return goals.map(serializeGoal);
}

export async function getGoal(userId, id) {
  const goal = await prisma.savingsGoal.findFirst({ where: { id, userId } });
  if (!goal) throw ApiError.notFound('Goal not found');
  return serializeGoal(goal);
}

export async function createGoal(userId, data) {
  const goal = await prisma.savingsGoal.create({
    data: {
      userId,
      name: data.name,
      targetAmount: toDecimal(data.targetAmount),
      savedAmount: toDecimal(data.savedAmount || 0),
      targetDate: data.targetDate || null,
      color: data.color,
    },
  });
  return serializeGoal(goal);
}

export async function updateGoal(userId, id, data) {
  await getGoal(userId, id);
  const payload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.targetAmount !== undefined) payload.targetAmount = toDecimal(data.targetAmount);
  if (data.targetDate !== undefined) payload.targetDate = data.targetDate;
  if (data.color !== undefined) payload.color = data.color;
  if (data.isArchived !== undefined) payload.isArchived = data.isArchived;
  const goal = await prisma.savingsGoal.update({ where: { id }, data: payload });
  return serializeGoal(goal);
}

export async function contributeToGoal(userId, id, amount) {
  const goal = await getGoal(userId, id);
  const newSaved = round2(goal.savedAmount + amount);
  if (newSaved < 0) throw ApiError.badRequest('Contribution cannot make saved amount negative');
  const updated = await prisma.savingsGoal.update({
    where: { id },
    data: { savedAmount: toDecimal(newSaved) },
  });
  return serializeGoal(updated);
}

export async function withdrawFromGoal(userId, id, amount) {
  return contributeToGoal(userId, id, -amount);
}

export async function deleteGoal(userId, id) {
  await getGoal(userId, id);
  await prisma.savingsGoal.delete({ where: { id } });
}

function serializeGoal(goal) {
  const target = toNum(goal.targetAmount);
  const saved = toNum(goal.savedAmount);
  return {
    ...goal,
    targetAmount: target,
    savedAmount: saved,
    pct: target > 0 ? Math.min(100, round2((saved / target) * 100)) : 0,
    completed: target > 0 && saved >= target,
  };
}
