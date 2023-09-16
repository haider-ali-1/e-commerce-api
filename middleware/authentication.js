import { ForbiddenError, UnathorizedError } from '../utils/custom-errors.js';
import { attachCookiesToResponse, isValidToken } from '../utils/auth.js';
import { asyncErrorHandler } from './async-error-handler.js';
import { Token } from '../models/Token.js';
import jwt from 'jsonwebtoken';
import { configValues } from '../config/app-config.js';
import {
  attachCookie,
  createPayload,
  signJWT,
  verifyJWT,
} from '../utils/helpers.js';

const authenticateUser = asyncErrorHandler(async (req, res, next) => {
  const { access_token, refresh_token } = req.signedCookies;

  if (access_token) {
    const decodedInfo = verifyJWT(access_token, process.env.JWT_SECRET);
    req.user = decodedInfo;
    return next();
  }
  // check if refresh token is valid - when access token expire
  if (refresh_token) {
    console.log('access_token expired');

    const decodedInfo = verifyJWT(refresh_token, process.env.JWT_SECRET);
    const { userId, name, role, refreshToken } = decodedInfo;
    const validToken = await Token.findOne({ user: userId, refreshToken });

    if (!validToken) throw new UnathorizedError('please login');

    // sign jwt for access token
    const jwtSecret = process.env.JWT_SECRET;
    const accessToken = signJWT(createPayload(decodedInfo), jwtSecret, 1 * 60);

    attachCookie(res, 'access_token', accessToken, 1 * 60 * 1000);

    req.user = decodedInfo;
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
