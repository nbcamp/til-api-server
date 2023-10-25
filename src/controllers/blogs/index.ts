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

export const CREATE = createRouter({
  method: "POST",
  authorized: true,
  descriptor: {
    name: "string",
    url: "string",
    rss: "string",
    keywords: [
      {
        keyword: "string",
        tags: ["string"],
      },
    ],
  },
  async handler(ctx): Promise<Blog> {
    const blog = await blogs.create({
      ...ctx.body,
      userId: ctx.auth.user.id,
    });

    return toBlog(blog);
  },
});
