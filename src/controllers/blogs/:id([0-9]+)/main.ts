import { createRouter } from "router";

import * as blogs from "services/blogs";

export const PATCH = createRouter({
  method: "PATCH",
  authorized: true,
  async handler(ctx) {
    return blogs.update(+ctx.param.id, {
      userId: ctx.auth.user.id,
      main: true,
    });
  },
});
