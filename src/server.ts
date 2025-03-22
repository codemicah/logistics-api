import "dotenv/config";
import { createServer } from "node:http";
import app from "./app";
import { config } from "./config/env";
import { connectToDatabase } from "./config/database";

const { PORT = 3000 } = config;

connectToDatabase()
  .then(() => {
    const server = createServer(app);

    server.listen(PORT, () => console.log(`Server running on ::${PORT}`));
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });
