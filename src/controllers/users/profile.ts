import { createRouter } from "router";
import { nullable, optional } from "utils/validator";

import * as users from "services/users";

import { User } from "models/User";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<User> {
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
  async handler(ctx): Promise<User> {
    const user = await users.update(ctx.auth.user.id, ctx.body);
    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
    };
  },
});

export const DELETE = createRouter({
  method: "DELETE",
  authorized: true,
  async handler(ctx): Promise<boolean> {
    await users.remove(ctx.auth.user.id);
    return true;
  },
});
