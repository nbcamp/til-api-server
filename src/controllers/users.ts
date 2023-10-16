export default {
  "/users"(request: Request) {
    return new Response("users", { status: 200 });
  },
};
