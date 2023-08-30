import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import jwt from 'jsonwebtoken';

import { errorHandlerMiddleware } from './middleware/global-error-handler.js';
import { notFoundMiddleware } from './middleware/not-found.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

app.get('/', async (req, res, next) => {
  // const decoded = jwt.verify(req.signedCookies.token, process.env.JWT_SECRET);
  // console.log(req.signedCookies.token);
  // console.log(decoded);
});

app.all('*', notFoundMiddleware);
app.use(errorHandlerMiddleware);

export { app };
