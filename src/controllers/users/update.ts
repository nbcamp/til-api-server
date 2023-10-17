import { createRouter } from "router";
import * as users from "@/services/users";

export default createRouter({
  method: "POST",
  authorized: true,
  descriptor: {
    name: "string nullable optional",
    avatarUrl: "string nullable optional",
  },
  async handler(ctx) {
    return users.update(ctx.auth.user.id, ctx.body);
  },
});
