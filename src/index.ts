import URLPattern from "url-pattern";

import router from "./controllers";

const PORT = 8080;

Bun.serve({
  port: PORT,
  development: true,
  async fetch(request) {
    const url = new URL(request.url);

    for (const [route, handler] of Object.entries(router)) {
      const pattern = new URLPattern(route);
      if (pattern.match(url.pathname)) {
        return await handler(request);
      }
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${PORT}`);
