import { User } from '../models/User.js';
import { asyncErrorHandler } from '../middleware/async-error-handler.js';
import { StatusCodes } from 'http-status-codes';
import { Token } from '../models/Token.js';
import {
  createPayloadUser,
  generateJwtToken,
  attachCookiesToResponse,
} from '../utils/auth.js';

import {
  BadRequestError,
  UnathorizedError,
  ConflictError,
  InternalServerError,
} from '../utils/custom-errors.js';
import { sendEmail } from '../utils/sendEmail.js';
import {
  attachCookie,
  compareValues,
  createPayload,
  generateCryptoToken,
  signJWT,
} from '../utils/helpers.js';
import jwt from 'jsonwebtoken';
import { configValues } from '../config/app-config.js';

// @ register user
// @ POST /api/v1/auth/register

const register = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    throw new BadRequestError('confirm password must match with password');

  const isUserExists = await User.findOne({ email });
  if (isUserExists)
    throw new ConflictError(`user with that email already exist`);

  const isFirstUser = (await User.countDocuments()) === 0;
  const role = isFirstUser ? 'admin' : 'user';

  const verificationToken = generateCryptoToken();

  const emailBody = {
    body: {
      name,
      intro: 'welcome to our app',
      action: {
        instructions: 'to verify your email please click below the button',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'verify your email',
          link: `${req.protocol}:${req.hostname}/api/v1/auth/verify-email/${verificationToken}`,
        },
      },
    },
  };

  try {
    await sendEmail({
      to: email,
      subject: 'email verification link',
      emailBody,
    });
  } catch (error) {
    throw new InternalServerError('could not send email');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });

  // const newUser = await User.create({ name, email, password, role });
  // const payload = createPayloadUser(newUser);
  // const token = generateJwtToken(payload);
  // attachCookiesToResponse(res, token);

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'please check your email to verify account',
    token: user.verificationToken,
  });
});

// @ register user
// @ POST /api/v1/auth/verify-email/:token

const verifyEmail = asyncErrorHandler(async (req, res, next) => {
  const { token: verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  // if user exist but token is invalid
  if (!user || user.verificationToken !== verificationToken)
    throw new UnathorizedError('verification failed');

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'your email is verified now' });
});

// @ register user
// @ POST /api/v1/auth/login

const login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // if email or password is missing
  if (!email || !password)
    throw new BadRequestError('email and password are required');

  const user = await User.findOne({ email });

  // if user not found
  if (!user) throw new UnathorizedError('user do not exist');

  // if password is not match with hashed password
  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch)
    throw new UnathorizedError('incorrect username or password');

  // if user not verified
  if (!user.isVerified) throw new UnathorizedError('please verify your email');

  // generate hashed token for refresh jwt token
  let hashedToken = generateCryptoToken();

  const token = await Token.findOne({ user: user._id });

  if (token) {
    if (!token.isValid) throw new UnathorizedError('suspecious activity');
    hashedToken = token.refreshToken;
  } else {
    await Token.create({
      user: user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      refreshToken: hashedToken,
    });
  }

  const payload = createPayload(user);
  const payloadWithRT = { ...payload, refreshToken: hashedToken };

  const jwtSecret = process.env.JWT_SECRET;

  const accessToken = signJWT(payload, jwtSecret, 1 * 60);
  const refreshToken = signJWT(payloadWithRT, jwtSecret, 24 * 60 * 60);

  attachCookie(res, 'access_token', accessToken, 1 * 60 * 1000);
  attachCookie(res, 'refresh_token', refreshToken, 24 * 60 * 60 * 1000);

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: { user: payload },
    accessToken,
    refreshToken,
  });
});

// @ register user
// @ POST /api/v1/auth/logout

const logout = asyncErrorHandler(async (req, res, next) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie('access_token', 'logout', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });

  res.cookie('refresh_token', 'logout', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'logout successfully' });
});

// @ forgot password
// @ /api/v1/auth/forgot-password

const forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email });
  if (!user) throw new BadRequestError('user with that email do not exist');

  const passwordResetToken = generateCryptoToken();

  user.passwordResetToken = passwordResetToken;
  user.passwordResetTokenExpires = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  // generating reset password link
  const protocol = req.protocol;
  const hostname = req.get('host');
  const passwordResetURL = `${protocol}://${hostname}/api/v1/auth/forgot-password/${user.passwordResetToken}`;

  // generate email html
  const emailBody = {
    body: {
      name: user.name,
      intro: 'welcome to our app',
      action: {
        instructions: 'to reset your password please click the below button',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'reset your password',
          link: passwordResetURL,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  await sendEmail({
    to: user.email,
    subject: 'reset password link',
    emailBody,
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'please check your email for reset password',
    data: { passwordResetToken },
  });
});

// @ forgot password
// @ /api/v1/auth/reset-password/:token

const resetPassword = asyncErrorHandler(async (req, res, next) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;
  const isSame = compareValues(newPassword, confirmPassword);
  if (!isSame) throw new BadRequestError('confirm password do not match');

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gte: new Date() },
  });

  if (!user) throw new UnathorizedError('token is invalid or expired');

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'password updated successfully',
  });
});

export { register, login, logout, verifyEmail, forgotPassword, resetPassword };
