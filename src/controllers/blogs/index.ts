import { createRouter } from "router";
import * as blogs from "services/blogs";

export default createRouter({
  authorized: true,
  async handler(ctx) {
    const list = await blogs.findAllByUserId(ctx.auth.user.id);
    return {
      items: list.map((blog) => ({
        id: blog.id,
        name: blog.name,
        url: blog.url,
        rss: blog.rss,
        primary: blog.primary,
        keywords: blog.KeywordTagMaps.map(({ keyword, tags }) => ({
          keyword,
          tags: JSON.parse(tags),
        })),
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
    keywords: [
      {
        keyword: "string",
        tags: ["string"],
      },
    ],
  },
  async handler(ctx) {
    const result = await blogs.create({
      ...ctx.body,
      userId: ctx.auth.user.id,
    });

    return {
      id: result.id,
    };
  },
});
