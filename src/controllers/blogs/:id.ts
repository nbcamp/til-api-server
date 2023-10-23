import { createRouter } from "router";
import { HttpError } from "utils/http";
import { optional } from "utils/validator";
import { toUnixTime } from "utils/unixtime";

import * as blogs from "services/blogs";

import { Blog } from "models/Blog";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<Blog> {
    const blog = await blogs.findOneById({
      blogId: +ctx.param.id,
      userId: ctx.auth.user.id,
    });
    if (!blog) {
      throw new HttpError("Not found", "NOT_FOUND");
    }
    return {
      id: blog.id,
      name: blog.name,
      url: blog.url,
      rss: blog.rss,
      primary: blog.primary,
      keywords: blog.keywordTagMaps as Blog["keywords"],
      createdAt: toUnixTime(blog.createdAt),
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
  async handler(ctx): Promise<Blog> {
    const blog = await blogs.update(+ctx.param.id, {
      name: ctx.body.name,
      primary: ctx.body.primary,
      userId: ctx.auth.user.id,
    });
    return {
      id: blog.id,
      name: blog.name,
      url: blog.url,
      rss: blog.rss,
      primary: blog.primary,
      keywords: blog.keywordTagMaps as Blog["keywords"],
      createdAt: toUnixTime(blog.createdAt),
    };
  },
});

export const DELETE = createRouter({
  method: "DELETE",
  authorized: true,
  async handler(ctx): Promise<boolean> {
    await blogs.remove({
      blogId: +ctx.param.id,
      userId: ctx.auth.user.id,
    });
    return true;
  },
});
