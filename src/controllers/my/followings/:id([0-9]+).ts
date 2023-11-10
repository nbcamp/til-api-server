import { createRouter } from "router";
import { users } from "services";
import { HttpError } from "utils/http";
import { User, toUser } from "models";

export const followUser = createRouter({
  description: "다른 사용자를 팔로우합니다.",
  method: "POST",
  authorized: true,
  async handler(ctx): Promise<User> {
    const userId = +ctx.param.id;
    if (ctx.auth.user.id === userId) {
      throw new HttpError("본인을 팔로우할 수 없습니다.", "BAD_REQUEST");
    }

    const user = await users.findById(ctx.auth.user.id, userId);
    if (!user) {
      throw new HttpError("사용자를 찾을 수 없습니다.", "NOT_FOUND");
    }

    const result = await users.follow(ctx.auth.user.id, userId);
    if (!result) {
      throw new HttpError("이미 팔로우한 사용자입니다.", "BAD_REQUEST");
    }

    return toUser(result);
  },
});

export const unfollowUser = createRouter({
  description: "내가 팔로우한 사용자를 언팔로우합니다.",
  method: "DELETE",
  authorized: true,
  async handler(ctx): Promise<User> {
    const userId = +ctx.param.id;
    const user = await users.findById(ctx.auth.user.id, userId);
    if (!user) {
      throw new HttpError("사용자를 찾을 수 없습니다.", "NOT_FOUND");
    }

    const result = await users.unfollow(ctx.auth.user.id, userId);
    if (!result) {
      throw new HttpError("팔로우하지 않은 사용자입니다.", "BAD_REQUEST");
    }

    return toUser(result);
  },
});
