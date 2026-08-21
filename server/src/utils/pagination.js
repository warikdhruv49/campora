import { ApiError } from './ApiError.js';

export const MAX_PAGE_LIMIT = 100;

export function getPagination(query, { defaultLimit = 25 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  let limit = parseInt(query.limit, 10) || defaultLimit;
  if (limit < 1) limit = defaultLimit;
  if (limit > MAX_PAGE_LIMIT) limit = MAX_PAGE_LIMIT;
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function buildPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}

export function parseDateRange(query) {
  const range = {};
  if (query.from) {
    const from = new Date(query.from);
    if (Number.isNaN(from.getTime())) throw ApiError.badRequest('Invalid "from" date');
    range.gte = from;
  }
  if (query.to) {
    const to = new Date(query.to);
    if (Number.isNaN(to.getTime())) throw ApiError.badRequest('Invalid "to" date');
    to.setHours(23, 59, 59, 999);
    range.lte = to;
  }
  return Object.keys(range).length ? range : undefined;
}
