import handler from "router";

const PORT = +(Bun.env.PORT || 3000);

function logger(request: Request) {
  console.log(`[${request.method}] ${request.url}`);
}

Bun.serve({
  port: PORT,
  development: true,
  async fetch(request) {
    logger(request);
    return handler(request);
  },
});

console.log(`Listening on http://localhost:${PORT}`);
