import { createRouter } from "router";
import { users } from "services";
import { HttpError } from "utils/http";

export const followUser = createRouter({
  description: "다른 사용자를 팔로우합니다.",
  method: "POST",
  authorized: true,
  async handler(ctx): Promise<boolean> {
    const userId = +ctx.param.id;
    if (ctx.auth.user.id === userId) {
      throw new HttpError("본인을 팔로우할 수 없습니다.", "BAD_REQUEST");
    }

    const toUser = await users.findById(userId);
    if (!toUser) {
      throw new HttpError("사용자를 찾을 수 없습니다.", "NOT_FOUND");
    }

    const result = await users.follow(ctx.auth.user.id, userId);
    if (!result) {
      throw new HttpError("이미 팔로우한 사용자입니다.", "BAD_REQUEST");
    }

    return true;
  },
});

export const unfollowUser = createRouter({
  description: "내가 팔로우한 사용자를 언팔로우합니다.",
  method: "DELETE",
  authorized: true,
  async handler(ctx): Promise<boolean> {
    const userId = +ctx.param.id;
    const toUser = await users.findById(userId);
    if (!toUser) {
      throw new HttpError("사용자를 찾을 수 없습니다.", "NOT_FOUND");
    }

    const result = await users.unfollow(ctx.auth.user.id, userId);
    if (!result) {
      throw new HttpError("팔로우하지 않은 사용자입니다.", "BAD_REQUEST");
    }

    return true;
  },
});
