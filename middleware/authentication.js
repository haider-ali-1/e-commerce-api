import { ForbiddenError, UnathorizedError } from '../utils/custom-errors.js';
import { attachCookiesToResponse, isValidToken } from '../utils/auth.js';
import { asyncErrorHandler } from './async-error-handler.js';
import { Token } from '../models/Token.js';
import jwt from 'jsonwebtoken';
import { configValues } from '../config/app-config.js';
import {
  attachCookie,
  attachCookies,
  createPayload,
  signJWT,
  verifyJWT,
} from '../utils/helpers.js';

const authenticateUser = asyncErrorHandler(async (req, res, next) => {
  const { access_token, refresh_token } = req.signedCookies;

  // extract info from access_token
  if (access_token) {
    const decodedData = verifyJWT(access_token);
    req.user = decodedData;
    return next();
  }

  if (refresh_token) {
    console.log('access_token expired');

    const { userId, name, role, refreshToken } = verifyJWT(refresh_token);

    const token = await Token.findOne({ user: userId, refreshToken });
    if (!token || !token?.isValid)
      throw new UnathorizedError('authentication invalid');

    const payload = { _id: userId, name, role };

    attachCookies(res, payload, refreshToken);
    req.user = verifyJWT(refresh_token);
    return next();
  }

  throw new UnathorizedError('please login');
});

const checkOwnership = (decodedData, resourceId) => {
  if (decodedData.userId === resourceId.toString()) return;
  if (decodedData.role === 'admin') return;
  throw new ForbiddenError('you dont have permission perform this action');
};

const authorizePermission = (...roles) =>
  asyncErrorHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`you don't have permission to access this page`);
    }
    next();
  });

export { authenticateUser, authorizePermission, checkOwnership };
