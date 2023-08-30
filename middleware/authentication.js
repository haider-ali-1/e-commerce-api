import { ForbiddenError, UnathorizedError } from '../utils/custom-errors.js';
import { isValidToken } from '../utils/jwt.js';
import { asyncErrorHandler } from './async-error-handler.js';

const authenticateUser = asyncErrorHandler(async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) throw new UnathorizedError('please login');

  const { userId, name, role } = isValidToken(token);
  req.user = { userId, name, role };
  next();
});

const authorizePermission = (...roles) =>
  asyncErrorHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`you don't have permission to access this page`);
    }
    next();
  });

export { authenticateUser, authorizePermission };
