import { createRouter } from "router";
import format from "date-fns/format";
import pkg from "/package.json";

const BUILD = format(new Date(), "yyyy-MM-dd HH:mm:ss");
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
