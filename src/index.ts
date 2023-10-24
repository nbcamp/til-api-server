import handler from "router";
import logger from "utils/logger";

const API_URL = Bun.env.API_URL || "http://localhost";
const PORT = +(Bun.env.PORT || 3000);

Bun.serve({
  port: PORT,
  development: true,
  async fetch(request) {
    logger.info(`${request.url}`, { request });
    return handler(request);
  },
});

logger.info(`Server is running on ${API_URL}:${PORT}`);
