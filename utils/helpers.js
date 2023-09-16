import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { userInfo } from 'node:os';

// __dirname
const getDirName = (metaURL) => dirname(fileURLToPath(metaURL));

// generate crypto token
const generateCryptoToken = () => {
  const randomString = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHmac('sha256', process.env.CRYPTO_SECRET_KEY)
    .update(randomString)
    .digest('hex');
  return hashedToken;
};

// compare
const compareValues = (val1, val2) => {
  return val1 === val2;
};

// create payload
const createPayload = (user) => {
  const { _id, name, role } = user;
  return { userId: _id, name, role };
};

// sign JWT
const signJWT = (payload, secretKey, expireTimeInSeconds) => {
  return jwt.sign(payload, secretKey, { expiresIn: expireTimeInSeconds });
};

// verify Token
const verifyJWT = (token, secretKey) => {
  return jwt.verify(token, secretKey);
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

export {
  getDirName,
  generateCryptoToken,
  compareValues,
  createPayload,
  signJWT,
  verifyJWT,
  attachCookie,
};
