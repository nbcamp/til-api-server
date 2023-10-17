import { createRouter } from "router";
import pkg from "/package.json";

const ENV = Bun.env.NODE_ENV || "development";
const TZ = Bun.env.TZ;

export default createRouter({
  handler() {
    return {
      version: pkg.version,
      build: new Date().toLocaleString("ko"),
      env: ENV,
      tz: TZ,
    };
  },
});
