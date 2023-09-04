import path from 'node:path';

import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { errorHandlerMiddleware } from './middleware/global-error-handler.js';
import { notFoundMiddleware } from './middleware/not-found.js';
import { getDirName } from './utils/helpers.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';

const app = express();

// console.log(__dirname);

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  express.static(path.join(getDirName(import.meta.url), 'public', 'uploads'))
);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);

app.get('/', async (req, res, next) => {
  // const decoded = jwt.verify(req.signedCookies.token, process.env.JWT_SECRET);
  // console.log(req.signedCookies.token);
  // console.log(decoded);
});

app.all('*', notFoundMiddleware);
app.use(errorHandlerMiddleware);

export { app };
