import { ApiError } from '../utils/ApiError.js';

// validate(zodSchema) checks req.body and replaces it with the parsed (cleaned) data
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues
      .map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message))
      .join(', ');
    return next(new ApiError(400, message));
  }
  req.body = result.data;
  next();
};
