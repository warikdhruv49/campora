import { Prisma } from '@prisma/client';

export const toNum = (value) => {
  if (value === null || value === undefined) return 0;
  return Number(value);
};

export const toDecimal = (value) => new Prisma.Decimal(Number(value).toFixed(2));

export const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const pctChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return round2(((current - previous) / Math.abs(previous)) * 100);
};

export const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

export const monthStart = (offset = 0) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - offset, 1);
};

export const dayKey = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const hourKey = (date) => `${dayKey(date)}T${String(new Date(date).getHours()).padStart(2, '0')}:00`;

export const serializeMoney = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'object' && obj instanceof Prisma.Decimal) return Number(obj);
  if (Array.isArray(obj)) return obj.map(serializeMoney);
  if (typeof obj === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(obj)) out[key] = serializeMoney(value);
    return out;
  }
  return obj;
};
