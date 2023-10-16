import URLPattern from "url-pattern";

import router from "./controllers";
import { tryCatch } from "./utilities/tryCatch";

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
          return await handler({
            param,
            query: Object.fromEntries(url.searchParams.entries()),
            body: body || {},
            request,
          });
        } catch (error) {
          console.log(error);
          if (error instanceof Error) {
            return new Response(error.message, { status: 500 });
          }
          return new Response("Internal server error", { status: 500 });
        }
      }
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${PORT}`);
