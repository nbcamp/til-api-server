import { createRouter } from "router";
import { users } from "services";

import { HttpError } from "utils/http";

export default createRouter({
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
