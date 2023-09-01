import 'dotenv/config';
import { app } from './app.js';
import { connectWithDatabase } from './db/connect.js';
import mongoose from 'mongoose';

const port = process.env.PORT || 3000;
const connectionString = process.env.MONGO_URL;

const startServer = async () => {
  try {
    await mongoose.connect(connectionString);
    console.log('connected with mongodb successfully');
    app.listen(port, () => {
      console.log(`server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error.message);
  }
};

startServer();
