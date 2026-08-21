import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export const validate = (schemas) => (req, _res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.validatedQuery = schemas.query.parse(req.query);
    if (schemas.params) req.validatedParams = schemas.params.parse(req.params);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.') || undefined,
        message: issue.message,
      }));
      return next(ApiError.badRequest(details[0]?.message || 'Validation failed', details));
    }
    next(error);
  }
};
