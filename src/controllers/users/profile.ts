import { createRouter } from "router";
import { nullable, optional } from "@/utils/validator";

import * as users from "services/users";

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

export const UPDATE = createRouter({
  method: "PATCH",
  authorized: true,
  descriptor: {
    username: optional(nullable("string")),
    avatarUrl: optional(nullable("string")),
  },
  async handler(ctx) {
    const result = await users.update(ctx.auth.user.id, ctx.body);
    return {
      id: result.id,
    };
  },
});

export const DELETE = createRouter({
  method: "DELETE",
  authorized: true,
  async handler(ctx) {
    await users.remove(ctx.auth.user.id);
    return {};
  },
});
