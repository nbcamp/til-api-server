import { createRouter } from "router";
import { blocks } from "services";

export const getMyBlockedUsers = createRouter({
  description: "나의 차단 사용자 목록을 가져옵니다.",
  authorized: true,
  async handler(ctx) {
    const blockedUsers = await blocks.findAll(ctx.auth.user.id);
    return blockedUsers.map((user) => ({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
    }));
  },
});
