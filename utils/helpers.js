import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { userInfo } from 'node:os';

// __dirname
const getDirName = (metaURL) => dirname(fileURLToPath(metaURL));

// generate crypto token
const generateCryptoToken = (randomBytesString) => {
  const randomString =
    randomBytesString || crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHmac('sha256', process.env.CRYPTO_SECRET_KEY)
    .update(randomString)
    .digest('hex');
  return { randomString, hashedToken };
};

// compare
const compareValues = (val1, val2) => {
  return val1 === val2;
};

// create payload
const createPayload = (user) => {
  return { userId: user._id, name: user.name, role: user.role };
};

// sign JWT
const signJWT = (payload, expireTimeInSeconds) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expireTimeInSeconds,
  });
};

// verify Token
const verifyJWT = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// attach cookie to header
const attachCookie = (res, name, value, expireTimeInMilliseconds) => {
  res.cookie(name, value, {
    httpOnly: true,
    maxAge: expireTimeInMilliseconds,
    signed: true,
    secure: process.env.NODE_ENV === 'production',
  });
};

const attachCookies = (res, user, hashedToken) => {
  const payload = createPayload(user);
  const accessToken = signJWT(payload, 1 * 60);
  const refreshToken = signJWT(
    { ...payload, refreshToken: hashedToken },
    24 * 60 * 60
  );

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    maxAge: 1 * 60 * 1000,
    signed: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    signed: true,
    secure: process.env.NODE_ENV === 'production',
  });

  return { payload };
};

export {
  getDirName,
  generateCryptoToken,
  compareValues,
  createPayload,
  signJWT,
  verifyJWT,
  attachCookie,
  attachCookies,
};
