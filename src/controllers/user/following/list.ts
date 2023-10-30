import { createRouter } from "router";
import { users } from "services";
import { User, toUser } from "models";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<User[]> {
    const options = {
      userId: ctx.auth.user.id,
      cursor: ctx.query.cursor ? +ctx.query.cursor : undefined,
      limit: ctx.query.limit ? +ctx.query.limit : undefined,
      desc: ctx.query.desc === "true",
    };

    const list = await users.findFollowings(options);
    return Promise.all(
      list.map(async (user) => users.withMetrics(toUser(user))),
    );
  },
});
