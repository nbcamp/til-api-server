import { createRouter } from "router";
import { User, toUser } from "models";
import { users } from "services";

export const getUserProfile = createRouter({
  description: "다른 사용자의 프로필을 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<User> {
    const user = await users.findById(+ctx.param.userId);
    return toUser(user);
  },
});
