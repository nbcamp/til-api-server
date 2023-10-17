import { createRouter } from "router";

export default createRouter({
  authorized: true,
  async handler(ctx) {
    const user = ctx.auth.user;
    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
    };
  },
});
