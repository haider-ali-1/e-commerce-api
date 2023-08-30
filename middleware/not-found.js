import { NotFoundError } from '../utils/custom-errors.js';
import { asyncErrorHandler } from './async-error-handler.js';

const notFoundMiddleware = asyncErrorHandler(async (req, res, next) => {
  throw new NotFoundError(`cannot find route ${req.originalUrl} on the server`);
});

export { notFoundMiddleware };
