import { body, param, validationResult } from 'express-validator';
import { BadRequestError, ConflictError } from '../utils/custom-errors.js';
import { User } from '../models/User.js';
import { asyncErrorHandler } from './async-error-handler.js';

// for duplicate email
const checkUserExist = async (email) => {
  const user = await User.findOne({ email });
  if (user) throw new ConflictError('user already exist');
  return true;
};

// check confirm password match
const confirmPasswordMatch = (confirmPassword, { req }) => {
  if (confirmPassword !== req.body.password)
    throw new BadRequestError('confirm password not match');
  return true;
};

const validate = (validations) => {
  return [
    validations,
    (req, res, next) => {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        const errorMessage = result
          .array()
          .map((error) => error.msg)
          .join('. ');
        throw new BadRequestError(errorMessage);
      }
      next();
    },
  ];
};

const validateRegisterUserInput = validate([
  body('name').notEmpty().withMessage('name is required'),

  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format')
    .custom(checkUserExist),

  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 8 })
    .withMessage('password must at least 8 characters long'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('confirm password is required')
    .custom(confirmPasswordMatch),
]);

const validateLoginUserInput = validate([
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format'),

  body('password').notEmpty().withMessage('password is required'),
]);

// Add Product Validation

const validateProductRegister = validate([
  body('name')
    .isString()
    .withMessage('product name should be a string')
    .notEmpty()
    .withMessage('name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('product name must be between 3 to 100 characters'),

  body('price')
    .isNumeric()
    .withMessage('price should be a number')
    .notEmpty()
    .withMessage('price is required'),
]);

export { validateRegisterUserInput, validateLoginUserInput };
