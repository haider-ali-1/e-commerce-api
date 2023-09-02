import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { errorHandlerMiddleware } from './middleware/global-error-handler.js';
import { notFoundMiddleware } from './middleware/not-found.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';
import { NotFoundError } from './utils/custom-errors.js';

import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

// console.log(__dirname);

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public', 'uploads')));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);

app.get('/', async (req, res, next) => {
  // const decoded = jwt.verify(req.signedCookies.token, process.env.JWT_SECRET);
  // console.log(req.signedCookies.token);
  // console.log(decoded);
});

app.all('*', (req, res) => {
  throw new NotFoundError(`cannot find ${req.originalUrl} on the server`);
});
app.use(errorHandlerMiddleware);

export { app };
