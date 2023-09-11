import { User } from '../models/User.js';
import { asyncErrorHandler } from '../middleware/async-error-handler.js';
import { StatusCodes } from 'http-status-codes';
import {
  createPayloadUser,
  generateJwtToken,
  attachCookiesToResponse,
} from '../utils/auth.js';

import { BadRequestError, UnathorizedError } from '../utils/custom-errors.js';
import { sendEmail } from '../utils/sendEmail.js';
import { compareValues, generateCryptoToken } from '../utils/helpers.js';

// @ register user
// @ POST /api/v1/auth/register

const register = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    throw new BadRequestError('confirm password must match with password');

  const isUserExists = await User.findOne({ email });
  if (isUserExists) throw new ConflictError(`user already exist`);

  const isFirstUser = (await User.countDocuments()) === 0;
  const role = isFirstUser ? 'admin' : 'user';

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken: generateCryptoToken(),
  });

  const emailBody = {
    body: {
      name: user.name,
      intro: 'welcome to our app',
      action: {
        instructions: 'to verify your email please click below the button',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'verify your email',
          link: `${req.protocol}:${req.hostname}/api/v1/auth/verify-email/${user.verificationToken}`,
        },
      },
    },
  };

  await sendEmail({
    to: user.email,
    subject: 'email verification link',
    emailBody,
  });

  // const newUser = await User.create({ name, email, password, role });
  // const payload = createPayloadUser(newUser);
  // const token = generateJwtToken(payload);
  // attachCookiesToResponse(res, token);

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'please check your email to verify account',
  });
});

// @ register user
// @ POST /api/v1/auth/verify-email/:token

const verifyEmail = asyncErrorHandler(async (req, res, next) => {
  const token = req.params.token;
  const user = await User.findOne({ verificationToken: token });

  // if user exist but token is invalid
  if (!user || user.verificationToken !== token)
    throw new UnathorizedError('verification failed');

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'your email is verified now' });
});

const login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new BadRequestError('email and password are required');

  const user = await User.findOne({ email });
  if (!user) throw new UnathorizedError('user do not exist');

  const passwordMatch = await user.comparePassword(password);

  if (!passwordMatch)
    throw new UnathorizedError('incorrect username or password');

  const payload = createPayloadUser(user);
  const token = generateJwtToken(payload);
  attachCookiesToResponse(res, token);

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', data: { user: payload }, token });
});

const logout = asyncErrorHandler(async (req, res, next) => {
  res.cookie('token', 'logout', {
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

  const token = generateCryptoToken();

  user.passwordResetToken = token;
  user.passwordResetTokenExpires = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  // generating reset password link
  const protocol = req.protocol;
  const hostname = req.get('host');
  const passwordResetToken = user.passwordResetToken;
  const passwordResetURL = `${protocol}://${hostname}/api/v1/auth/forgot-password/${passwordResetToken}`;

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
    data: { token },
  });
});

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
