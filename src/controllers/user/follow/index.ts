import { createRouter } from "router";
import { users } from "services";

import { HttpError } from "utils/http";

export default createRouter({
  method: "POST",
  authorized: true,
  descriptor: {
    userId: "number",
  },
  async handler(ctx): Promise<boolean> {
    if (ctx.auth.user.id === ctx.body.userId) {
      throw new HttpError("본인을 팔로우할 수 없습니다.", "BAD_REQUEST");
    }

    const toUser = await users.findById(ctx.body.userId);
    if (!toUser) {
      throw new HttpError("사용자를 찾을 수 없습니다.", "NOT_FOUND");
    }

    const result = await users.follow(ctx.auth.user.id, ctx.body.userId);
    if (!result) {
      throw new HttpError("이미 팔로우한 사용자입니다.", "BAD_REQUEST");
    }

    return true;
  },
});
