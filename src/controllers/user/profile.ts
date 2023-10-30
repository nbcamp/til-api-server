import { createRouter } from "router";
import { User, toUser } from "models";
import { users } from "services";

import { nullable, optional } from "utils/validator";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<User> {
    return users.withMetrics(toUser(ctx.auth.user));
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
    return users.withMetrics(toUser(user));
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
