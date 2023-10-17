import URLPattern from "url-pattern";

import router from "router";
import { tryCatch } from "./utilities/tryCatch";
import { response } from "./utilities/response";

const PORT = 8080;

Bun.serve({
  port: PORT,
  development: true,
  async fetch(request) {
    const url = new URL(request.url);
    for (const [route, { method, handler }] of Object.entries(router)) {
      const pattern = new URLPattern(route);
      const param = pattern.match(url.pathname);
      if (param && method === request.method) {
        try {
          const body = await tryCatch(() => request.json());
          const result = await handler({
            param,
            query: Object.fromEntries(url.searchParams.entries()),
            body: body || {},
            request,
          });
          return response(result, "OK");
        } catch (error) {
          console.error(error);
          return response(
            { error: "Internal Server Error" },
            "INTERNAL_SERVER_ERROR",
          );
        }
      }
    }

    return response({ error: "Not Found" }, "NOT_FOUND");
  },
});

console.log(`Listening on http://localhost:${PORT}`);
