import { createRouter } from "router";
import { AuthUser, toAuthUser } from "models";
import { users } from "services";

import { nullable, optional } from "utils/validator";

export const getMyProfile = createRouter({
  description: "내 프로필을 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<AuthUser> {
    return toAuthUser(await users.findAuthUser(ctx.auth.user.id));
  },
});

export const updateMyProfile = createRouter({
  description: "내 프로필을 수정합니다.",
  method: "PATCH",
  authorized: true,
  descriptor: {
    username: optional(nullable("string")),
    avatarUrl: optional(nullable("string")),
    isAgreed: optional(nullable("boolean")),
  },
  async handler(ctx): Promise<AuthUser> {
    const user = await users.update(ctx.auth.user.id, ctx.body);
    return toAuthUser(user);
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
