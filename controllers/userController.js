import { asyncErrorHandler } from '../middleware/async-error-handler.js';
import { User } from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnathorizedError } from '../utils/custom-errors.js';
import {
  createPayloadUser,
  generateJwtToken,
  attachCookiesToResponse,
} from '../utils/auth.js';
import { checkOwnership } from '../middleware/authentication.js';

const getAllUsers = asyncErrorHandler(async (req, res, next) => {
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ status: 'success', data: { users } });
});

const getSingleUser = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new BadRequestError(`cannot found user with id: ${id}`);

  checkOwnership(req.user, user._id);

  res.status(StatusCodes.OK).json({ status: 'success', data: { user } });
});

const showCurrentUser = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', data: { user: req.user } });
});

const updateUserPassword = asyncErrorHandler(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword)
    throw new BadRequestError('all fields are required');

  if (newPassword !== confirmPassword)
    throw new BadRequestError('confirm password must match with password');

  const user = await User.findById(req.user.userId);
  const passwordMatch = await user.comparePassword(oldPassword);

  if (!passwordMatch) throw new UnathorizedError('incorrect email or password');

  user.password = newPassword;
  await user.save();

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', data: { user: req.user } });
});

const updateUser = asyncErrorHandler(async (req, res, next) => {
  const { name, email } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user.userId,
    { name, email },
    { new: true, runValidators: true }
  );

  const payload = createPayloadUser(updatedUser);
  const token = generateJwtToken(payload);
  attachCookiesToResponse(res, token);

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', data: { user: req.user } });
});

export {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
