const PORT = 8080;

Bun.serve({
  port: PORT,
  async fetch(request) {
    return new Response("Hello, World!", { status: 200 });
  },
});

console.log(`Listening on http://localhost:${PORT}`);
