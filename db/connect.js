import mongoose from "mongoose";

const connectWithDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("connected with database successfully");
  } catch (error) {
    console.log(`connection failed ${error.message}`);
  }
};

export { connectWithDatabase };
