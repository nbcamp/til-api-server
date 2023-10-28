import { createRouter } from "router";
import { User, UserMetrics, toUser } from "models";
import { users } from "services";

import { nullable, optional } from "utils/validator";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<User & UserMetrics> {
    const user = ctx.auth.user;
    const metrics = await users.metrics(user.id);
    return {
      ...toUser(user),
      ...metrics,
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
    return toUser(user);
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
