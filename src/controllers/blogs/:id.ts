import { createRouter } from "router";
import { optional } from "@/guards/type-guard";

import * as blogs from "services/blogs";

export default createRouter({
  authorized: true,
  async handler(ctx) {
    const blog = await blogs.findOneById(+ctx.param.id);
    return {
      item: blog
        ? {
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
          }
        : null,
    };
  },
});

export const UPDATE = createRouter({
  method: "PATCH",
  authorized: true,
  descriptor: {
    name: optional("string"),
    primary: optional("boolean"),
    keywords: optional([
      {
        keyword: "string",
        tags: ["string"],
      },
    ]),
  },
  async handler(ctx) {
    const result = await blogs.update(+ctx.param.id, {
      name: ctx.body.name,
      primary: ctx.body.primary,
      userId: ctx.auth.user.id,
    });
    return {
      id: result.id,
    };
  },
});

export const DELETE = createRouter({
  method: "DELETE",
  authorized: true,
  async handler(ctx) {
    await blogs.remove(+ctx.param.id);
    return {
      ok: true,
    };
  },
});
