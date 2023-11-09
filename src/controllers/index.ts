import { createRouter } from "router";
import pkg from "/package.json";
import { formatISO } from "date-fns";

const BUILD = formatISO(new Date());
const ENV = Bun.env.NODE_ENV || "development";
const TZ = Bun.env.TZ;

export const ping = createRouter({
  description: "서버 상태를 확인합니다.",
  handler() {
    return {
      message: "pong",
      version: pkg.version,
      build: BUILD,
      env: ENV,
      tz: TZ,
    };
  },
});
