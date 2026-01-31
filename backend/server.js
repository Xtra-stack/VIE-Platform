import http from "http";
import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { logger } from "./src/config/logger.js";

const server = http.createServer(app);

server.listen(env.port, () => {
  logger.info(`VIE backend running on port ${env.port} (${env.nodeEnv})`);
});
