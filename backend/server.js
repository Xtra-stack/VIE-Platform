import http from "http";
import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDatabase } from "./src/config/database.js";
import { logger } from "./src/config/logger.js";

const server = http.createServer(app);

const startServer = async () => {
  await connectDatabase();

  server.listen(env.port, () => {
    logger.info(`VIE backend running on port ${env.port} (${env.nodeEnv})`);
  });
};

startServer().catch((error) => {
  logger.error(`Server failed to start: ${error.message}`);
  process.exit(1);
});
