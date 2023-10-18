import URLPattern from "url-pattern";

import routers from "router";
import { tryCatch } from "./utilities/tryCatch";
import { response } from "./utilities/response";
import { HttpError } from "./utilities/error";

const PORT = +(Bun.env.PORT || 3000);

function logger(request: Request) {
  console.log(`[${request.method}] ${request.url}`);
}

Bun.serve({
  port: PORT,
  development: true,
  async fetch(request) {
    logger(request);
    const url = new URL(request.url);
    for (const { route, method, handler } of routers) {
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
          if (error instanceof HttpError) {
            return response({ error: error.message }, error.status);
          }
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
