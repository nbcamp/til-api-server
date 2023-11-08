import { createRouter } from "router";
import { User, toUser } from "models";
import { users } from "services";

import { nullable, optional } from "utils/validator";

export const getMyProfile = createRouter({
  description: "내 프로필을 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<User> {
    return ctx.auth.user;
  },
});

export const updateMyProfile = createRouter({
  description: "내 프로필을 수정합니다.",
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

export const deleteMyProfile = createRouter({
  description: "내 프로필을 삭제합니다.",
  method: "DELETE",
  authorized: true,
  async handler(ctx): Promise<boolean> {
    await users.remove(ctx.auth.user.id);
    return true;
  },
});
