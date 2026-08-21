import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { round2, toDecimal, toNum } from '../utils/money.js';
import { createTransaction } from './transaction.service.js';

const includeRule = {
  account: { select: { id: true, name: true, color: true, type: true } },
  category: { select: { id: true, name: true, color: true, icon: true } },
};

function serializeRule(rule) {
  return { ...rule, amount: toNum(rule.amount) };
}

export async function listRecurring(userId) {
  const rules = await prisma.recurringTransaction.findMany({
    where: { userId },
    include: includeRule,
    orderBy: [{ isActive: 'desc' }, { nextDate: 'asc' }],
  });
  return rules.map(serializeRule);
}

export async function getRecurring(userId, id) {
  const rule = await prisma.recurringTransaction.findFirst({ where: { id, userId }, include: includeRule });
  if (!rule) throw ApiError.notFound('Recurring rule not found');
  return serializeRule(rule);
}

export async function createRecurring(userId, data) {
  const account = await prisma.account.findFirst({ where: { id: data.accountId, userId } });
  if (!account) throw ApiError.badRequest('Invalid account');
  if (data.categoryId) {
    const category = await prisma.category.findFirst({ where: { id: data.categoryId, userId } });
    if (!category) throw ApiError.badRequest('Invalid category');
  }
  const rule = await prisma.recurringTransaction.create({
    data: {
      userId,
      accountId: data.accountId,
      categoryId: data.categoryId || null,
      type: data.type,
      amount: toDecimal(data.amount),
      currency: 'INR',
      merchant: data.merchant || null,
      description: data.description || null,
      frequency: data.frequency,
      customDays: data.customDays || null,
      nextDate: data.nextDate,
      autoCreate: data.autoCreate,
      isActive: data.isActive,
    },
    include: includeRule,
  });
  return serializeRule(rule);
}

export async function updateRecurring(userId, id, data) {
  await getRecurring(userId, id);
  const payload = {};
  if (data.type !== undefined) payload.type = data.type;
  if (data.amount !== undefined) payload.amount = toDecimal(data.amount);
  if (data.accountId !== undefined) payload.accountId = data.accountId;
  if (data.categoryId !== undefined) payload.categoryId = data.categoryId;
  if (data.merchant !== undefined) payload.merchant = data.merchant;
  if (data.description !== undefined) payload.description = data.description;
  if (data.frequency !== undefined) payload.frequency = data.frequency;
  if (data.customDays !== undefined) payload.customDays = data.customDays;
  if (data.nextDate !== undefined) payload.nextDate = data.nextDate;
  if (data.autoCreate !== undefined) payload.autoCreate = data.autoCreate;
  if (data.isActive !== undefined) payload.isActive = data.isActive;

  const rule = await prisma.recurringTransaction.update({ where: { id }, data: payload, include: includeRule });
  return serializeRule(rule);
}

export async function deleteRecurring(userId, id) {
  await getRecurring(userId, id);
  await prisma.recurringTransaction.delete({ where: { id } });
}

function advanceDate(date, frequency, customDays) {
  const d = new Date(date);
  switch (frequency) {
    case 'WEEKLY':
      d.setDate(d.getDate() + 7);
      return d;
    case 'MONTHLY':
      d.setMonth(d.getMonth() + 1);
      return d;
    case 'YEARLY':
      d.setFullYear(d.getFullYear() + 1);
      return d;
    case 'CUSTOM':
      d.setDate(d.getDate() + (customDays || 1));
      return d;
    default:
      d.setMonth(d.getMonth() + 1);
      return d;
  }
}

export async function processDueRules(userId) {
  const now = new Date();
  const due = await prisma.recurringTransaction.findMany({
    where: { userId, isActive: true, autoCreate: true, nextDate: { lte: now } },
    take: 50,
  });

  let created = 0;
  for (const rule of due) {
    let cursor = new Date(rule.nextDate);
    let guard = 0;
    while (cursor <= now && guard < 24) {
      await createTransaction(userId, {
        type: rule.type,
        amount: toNum(rule.amount),
        accountId: rule.accountId,
        categoryId: rule.categoryId,
        merchant: rule.merchant,
        description: rule.description || `Recurring · ${rule.frequency.toLowerCase()}`,
        reference: `REC-${rule.id.slice(-6).toUpperCase()}`,
        status: 'COMPLETED',
        transactionDate: cursor,
      });
      created += 1;
      cursor = advanceDate(cursor, rule.frequency, rule.customDays);
      guard += 1;
    }
    await prisma.recurringTransaction.update({
      where: { id: rule.id },
      data: { nextDate: cursor > now ? cursor : advanceDate(now, rule.frequency, rule.customDays), lastRunAt: now },
    });
  }
  return created;
}

export async function runRuleNow(userId, id) {
  const rule = await getRecurring(userId, id);
  const now = new Date();
  await createTransaction(userId, {
    type: rule.type,
    amount: rule.amount,
    accountId: rule.accountId,
    categoryId: rule.category?.id || null,
    merchant: rule.merchant,
    description: rule.description || 'Recurring payment',
    reference: `REC-${rule.id.slice(-6).toUpperCase()}`,
    status: 'COMPLETED',
    transactionDate: now,
  });
  let next = advanceDate(new Date(rule.nextDate) > now ? new Date(rule.nextDate) : now, rule.frequency, rule.customDays);
  const updated = await prisma.recurringTransaction.update({
    where: { id },
    data: { nextDate: next, lastRunAt: now },
    include: includeRule,
  });
  return serializeRule(updated);
}

export async function upcomingPayments(userId, days = 30) {
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  const rules = await prisma.recurringTransaction.findMany({
    where: { userId, isActive: true, nextDate: { lte: limit } },
    include: includeRule,
    orderBy: { nextDate: 'asc' },
    take: 8,
  });
  return rules.map((rule) => ({
    ...serializeRule(rule),
    dueInDays: Math.max(0, Math.ceil((new Date(rule.nextDate) - new Date()) / 86400000)),
  }));
}
