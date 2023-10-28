import { createRouter } from "router";
import { users } from "services";
import { User, UserMetrics, toUser } from "models";

import { HttpError } from "utils/http";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<User & UserMetrics> {
    if (!ctx.query.userId) {
      throw new HttpError("사용자를 찾을 수 없습니다.", "NOT_FOUND");
    }
    const user = await users.findById(+ctx.query.userId);
    if (!user) {
      throw new HttpError("사용자를 찾을 수 없습니다.", "NOT_FOUND");
    }
    const metrics = await users.metrics(user.id);
    return {
      ...toUser(user),
      ...metrics,
    };
  },
});
