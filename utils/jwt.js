import jwt from 'jsonwebtoken';

const generateJwtToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const isValidToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = (res, token) => {
  const msInOneDay = 24 * 60 * 60 * 1000;
  res.cookie('token', token, {
    expires: new Date(Date.now() + msInOneDay),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });
};

export { generateJwtToken, isValidToken, attachCookiesToResponse };
