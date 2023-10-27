import { createRouter } from "router";
import { Blog, toBlog } from "models";
import { blogs } from "services";

export const PATCH = createRouter({
  method: "PATCH",
  authorized: true,
  async handler(ctx): Promise<Blog> {
    const blog = await blogs.update(+ctx.param.id, {
      userId: ctx.auth.user.id,
      main: true,
    });
    return toBlog(blog);
  },
});
