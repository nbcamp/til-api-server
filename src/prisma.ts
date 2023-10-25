import { PrismaClient } from "@prisma/client";
import logger from "utils/logger";

const ORM_VERBOSE = Bun.env.ORM_VERBOSE === "true";

export const prisma = new PrismaClient({
  log: ORM_VERBOSE
    ? [
        { emit: "event", level: "error" },
        { emit: "event", level: "info" },
        { emit: "event", level: "warn" },
        { emit: "event", level: "query" },
      ]
    : [
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" },
      ],
});

const option = { label: "ORM" };

prisma.$on("query", (event) => {
  logger.info("Query: " + event.query, option);
  logger.info("Params: " + JSON.stringify(event.params), option);
  logger.info("Duration: " + event.duration + "ms", option);
});

prisma.$on("info", (event) => {
  logger.info(event.message, option);
});

prisma.$on("warn", (event) => {
  logger.warn(event.message, option);
});

prisma.$on("error", (event) => {
  logger.error(event.message, option);
});
