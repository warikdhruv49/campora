import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { round2, toDecimal, toNum } from '../utils/money.js';

export const CREDIT_TYPES = ['CREDIT_CARD'];
export const LIQUID_TYPES = ['CHECKING', 'SAVINGS', 'CASH', 'DIGITAL_WALLET'];

const ownershipWhere = (userId) => ({ userId });

export async function listAccounts(userId, { includeInactive = true } = {}) {
  const where = { ...ownershipWhere(userId), ...(includeInactive ? {} : { isActive: true }) };
  const accounts = await prisma.account.findMany({
    where,
    orderBy: [{ isActive: 'desc' }, { createdAt: 'asc' }],
    include: {
      _count: { select: { transactions: true } },
    },
  });
  return accounts.map((account) => ({
    ...account,
    balance: toNum(account.balance),
    transactionCount: account._count.transactions,
    _count: undefined,
  }));
}

export async function getAccount(userId, id) {
  const account = await prisma.account.findFirst({ where: { id, ...ownershipWhere(userId) } });
  if (!account) throw ApiError.notFound('Account not found');
  return { ...account, balance: toNum(account.balance) };
}

export async function createAccount(userId, data) {
  const account = await prisma.account.create({ data: { ...data, userId, balance: toDecimal(data.balance ?? 0) } });
  return { ...account, balance: toNum(account.balance) };
}

export async function updateAccount(userId, id, data) {
  await getAccount(userId, id);
  const payload = { ...data };
  if (payload.balance !== undefined) payload.balance = toDecimal(payload.balance);
  const account = await prisma.account.update({ where: { id }, data: payload });
  return { ...account, balance: toNum(account.balance) };
}

export async function deleteAccount(userId, id) {
  await getAccount(userId, id);
  await prisma.account.delete({ where: { id } });
}

export async function getAccountStats(userId, id) {
  const account = await getAccount(userId, id);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [inflow, outflow, thisMonth] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, accountId: id, status: 'COMPLETED', type: 'INCOME' },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, accountId: id, status: 'COMPLETED', type: 'EXPENSE' },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, accountId: id, status: 'COMPLETED', transactionDate: { gte: monthStart } },
      _sum: { amount: true },
    }),
  ]);

  return {
    accountId: account.id,
    balance: account.balance,
    totalInflow: toNum(inflow._sum.amount),
    totalOutflow: toNum(outflow._sum.amount),
    netFlow: round2(toNum(inflow._sum.amount) - toNum(outflow._sum.amount)),
    thisMonthNet: toNum(thisMonth._sum.amount),
    transactionCount: account.transactionCount ?? (await prisma.transaction.count({ where: { userId, accountId: id } })),
  };
}

export function computeNetWorth(accounts) {
  let assets = 0;
  let liabilities = 0;
  for (const account of accounts) {
    if (!account.isActive) continue;
    if (CREDIT_TYPES.includes(account.type)) liabilities += Math.abs(toNum(account.balance));
    else assets += toNum(account.balance);
  }
  return { assets: Number(assets.toFixed(2)), liabilities: Number(liabilities.toFixed(2)), netWorth: Number((assets - liabilities).toFixed(2)) };
}
