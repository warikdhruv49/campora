import { CURRENCIES } from '../config/constants.js';

const symbolFor = (code) => CURRENCIES.find((c) => c.code === code)?.symbol || '₹';

export function formatCurrency(value, { currency = 'INR', compact = false, signed = false, decimals = 2 } = {}) {
  const num = Number(value) || 0;
  const abs = Math.abs(num);
  let formatted;
  if (compact && abs >= 10000000) {
    formatted = `${(abs / 10000000).toFixed(2)}Cr`;
  } else if (compact && abs >= 100000) {
    formatted = `${(abs / 100000).toFixed(2)}L`;
  } else if (compact && abs >= 1000) {
    formatted = `${(abs / 1000).toFixed(1)}K`;
  } else {
    formatted = abs.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  const sign = num < 0 ? '−' : signed ? '+' : '';
  return `${sign}${symbolFor(currency)}${formatted}`;
}

export function formatPercent(value, { signed = true } = {}) {
  const num = Number(value) || 0;
  const sign = num > 0 && signed ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function trendOf(value) {
  const num = Number(value) || 0;
  if (num > 0) return 'up';
  if (num < 0) return 'down';
  return 'flat';
}
