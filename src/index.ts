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

    for (const [route, handler] of Object.entries(router)) {
      const pattern = new URLPattern(route);
      const param = pattern.match(url.pathname);
      const body = await tryCatch(() => request.json());
      if (param) {
        try {
          const result = await handler({
            param,
            query: Object.fromEntries(url.searchParams.entries()),
            body: body || {},
            request,
          });
          return response(result, "OK");
        } catch (error) {
          return error instanceof Error
            ? response({ error: error.message }, "INTERNAL_SERVER_ERROR")
            : response(
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
