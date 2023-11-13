import { createRouter } from "router";
import { blocks } from "services";
import { HttpError } from "utils/http";

export const blockUser = createRouter({
  description: "사용자를 차단합니다.",
  method: "POST",
  authorized: true,
  async handler(ctx) {
    if (ctx.auth.user.id === +ctx.param.userId) {
      throw new HttpError("본인을 차단할 수 없습니다.", "BAD_REQUEST");
    }
    const blockedUser = await blocks.block(ctx.auth.user.id, +ctx.param.userId);
    return {
      id: blockedUser.id,
      username: blockedUser.username,
      avatarUrl: blockedUser.avatarUrl,
    };
  },
});

export const unblockUser = createRouter({
  description: "사용자 차단을 해제합니다.",
  method: "DELETE",
  authorized: true,
  async handler(ctx) {
    if (ctx.auth.user.id === +ctx.param.userId) {
      throw new HttpError("본인을 차단 해제할 수 없습니다.", "BAD_REQUEST");
    }
    const unblockedUser = await blocks.unblock(
      ctx.auth.user.id,
      +ctx.param.userId,
    );
    return {
      id: unblockedUser.id,
      username: unblockedUser.username,
      avatarUrl: unblockedUser.avatarUrl,
    };
  },
});
