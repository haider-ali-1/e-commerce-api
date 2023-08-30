import "dotenv/config";
import { app } from "./app.js";
import { connectWithDatabase } from "./db/connect.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectWithDatabase();
  app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
};

startServer();
