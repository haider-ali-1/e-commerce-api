import { User } from '../models/User.js';
import { asyncErrorHandler } from '../middleware/async-error-handler.js';
import { StatusCodes } from 'http-status-codes';
import {
  createPayloadUser,
  generateJwtToken,
  attachCookiesToResponse,
} from '../utils/auth.js';

import { BadRequestError, UnathorizedError } from '../utils/custom-errors.js';

const register = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // if (password !== confirmPassword)
  //   throw new BadRequestError('confirm password must match with password');

  // const userExist = await User.findOne({ email });
  // if (userExist) throw new ConflictError(`user already exist`);

  const isFirstUser = (await User.countDocuments()) === 0;
  const role = isFirstUser ? 'admin' : 'user';

  const newUser = await User.create({ name, email, password, role });

  const payload = createPayloadUser(newUser);
  const token = generateJwtToken(payload);
  attachCookiesToResponse(res, token);

  res
    .status(StatusCodes.CREATED)
    .json({ status: 'success', data: { user: newUser }, token });
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

export { register, login, logout };
