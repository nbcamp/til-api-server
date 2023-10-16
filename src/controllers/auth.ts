export default {
  "/auth"(request: Request) {
    return new Response("auth", { status: 200 });
  },
};
