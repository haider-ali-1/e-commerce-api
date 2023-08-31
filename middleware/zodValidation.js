import 'dotenv/config.js';
import { User } from '../models/User.js';
import { connectWithDatabase } from '../db/connect.js';
import z from 'zod';

const confirmPwdMatch = (data) => {
  const { password, confirmPassword } = data;
  return password === confirmPassword;
};

const userExist = async (email) => {
  const user = await User.findOne({ email });
  if (user) return false;
};

const userSchema = z
  .object({
    name: z.string().nonempty('name is required'),

    email: z
      .string()
      .nonempty('email is required')
      .email('invalid email format')
      .refine(userExist, { message: 'email already exist' }),

    password: z
      .string()
      .nonempty('password is required')
      .min(8, { message: 'password must be at least 8 characters long' }),

    confirmPassword: z.string().nonempty('confirm password is required'),
  })
  .refine(confirmPwdMatch, { message: 'confirm password not match' });

const validateSchema = (schema) => {
  return async (req, res, next) => {
    try {
      const data = await schema.parseAsync(req.body);
      console.log(data);
      next();
    } catch (error) {
      res.status(400).json({ error: JSON.parse(error.message) });
    }
  };
};

export { validateSchema, userSchema };
