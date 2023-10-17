import { createRouter } from "router";
import * as blogs from "services/blogs";

export default createRouter({
  authorized: true,
  async handler(ctx) {
    const list = await blogs.findAllByOwnerId(ctx.auth.user.id);
    return {
      items: list.map((blog) => ({
        id: blog.id,
        name: blog.name,
        url: blog.url,
        rss: blog.rss,
        primary: blog.primary,
        createdAt: blog.createdAt,
      })),
    };
  },
});

export const CREATE = createRouter({
  method: "POST",
  authorized: true,
  descriptor: {
    name: "string",
    url: "string",
    rss: "string",
  },
  async handler(ctx) {
    const result = await blogs.create({
      ...ctx.body,
      ownerId: ctx.auth.user.id,
    });
    return {
      id: result.id,
    };
  },
});
