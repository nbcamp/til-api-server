import { createRouter } from "router";
import { blogs } from "services";
import { Blog, toBlog } from "models";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<Blog[]> {
    const list = await blogs.findAllByUserId(ctx.auth.user.id);
    return list.map(toBlog);
  },
});
