import jwt from 'jsonwebtoken';

// @ Generate Pyload Object
const createPayloadUser = (user) => {
  return { userId: user._id, name: user.name, role: user.role };
};

// @ Generate JWT Token
const generateJwtToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// @ Check Token Validity
const isValidToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// @ Attach Cookies to Headers for Auth
const attachCookiesToResponse = ({ res, accessToken, refreshToken }) => {
  // attach access token to header
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    maxAge: 1 * 60, // 1 minute
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });

  // attach refresh token to header
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });

  return { accessToken, refreshToken };
};

export {
  createPayloadUser,
  generateJwtToken,
  isValidToken,
  attachCookiesToResponse,
};
