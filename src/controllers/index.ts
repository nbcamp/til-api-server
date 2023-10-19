import { createRouter } from "router";
import format from "date-fns/format";
import pkg from "/package.json";

const BUILD = format(new Date(), "yyyy-MM-dd HH:mm:ss");
const ENV = Bun.env.NODE_ENV || "development";
const TZ = Bun.env.TZ;

export default createRouter({
  handler() {
    return {
      version: pkg.version,
      build: BUILD,
      env: ENV,
      tz: TZ,
    };
  },
});
