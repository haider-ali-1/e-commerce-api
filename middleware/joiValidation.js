import Joi from 'joi';
import { BadRequestError } from '../utils/custom-errors.js';
import { User } from '../models/User.js';

const commonMessages = {
  'string.base': '{#label} shoule be a string',
  'string.email': 'invalid email format',
  'string.min': '{#label} must be at least {#limit} characters long',
  'any.only': 'password confirmation does not match the password field',
  'any.required': '{#lebel} is required',
};

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
  confirmPassword: Joi.valid(Joi.ref('password')),
})
  .messages(commonMessages)
  .options({ abortEarly: false, stripUnknown: true });

const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const validate = (validationSchema) => async (req, res, next) => {
  const { error, value } = validationSchema.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((err) => err.message).join('. ');
    next(new BadRequestError(errorMessage));
  }
  next();
};

export { validate, userSchema, loginUserSchema };
