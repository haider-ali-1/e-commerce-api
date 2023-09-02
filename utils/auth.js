import jwt from 'jsonwebtoken';

const createPayloadUser = (user) => {
  return { userId: user._id, name: user.name, role: user.role };
};

const generateJwtToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const isValidToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = (res, token) => {
  const milisecondsInOneDay = 24 * 60 * 60 * 1000;
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: milisecondsInOneDay,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });
};

export {
  createPayloadUser,
  generateJwtToken,
  isValidToken,
  attachCookiesToResponse,
};
