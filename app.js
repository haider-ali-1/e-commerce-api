import path from 'node:path';

import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

import { errorHandlerMiddleware } from './middleware/global-error-handler.js';
import { notFoundMiddleware } from './middleware/not-found.js';
import { getDirName } from './utils/helpers.js';
import { corsOptions } from './configs/cors-options.js';

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import orderRouter from './routes/orderRoutes.js';

const app = express();

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);

app.use(
  express.static(path.resolve(getDirName(import.meta.url), './public/uploads'))
);

app.all('*', notFoundMiddleware);
app.use(errorHandlerMiddleware);

export { app };
