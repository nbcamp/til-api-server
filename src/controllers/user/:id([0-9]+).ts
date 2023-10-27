import { createRouter } from "router";
import { users } from "services";
import { User, toUser } from "models";

import { HttpError } from "utils/http";

export default createRouter({
  authorized: true,
  descriptor: {
    userId: "number",
  },
  async handler(ctx): Promise<User> {
    const user = await users.findById(ctx.body.userId);
    if (!user) {
      throw new HttpError("사용자를 찾을 수 없습니다.", "NOT_FOUND");
    }
    return toUser(user);
  },
});
