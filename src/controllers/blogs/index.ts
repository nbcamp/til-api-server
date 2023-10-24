import { createRouter } from "router";
import { toUnixTime } from "utils/unixtime";

import * as blogs from "services/blogs";

import { Blog } from "models/Blog";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<Blog[]> {
    const list = await blogs.findAllByUserId(ctx.auth.user.id);
    return list.map((blog) => ({
      id: blog.id,
      name: blog.name,
      url: blog.url,
      rss: blog.rss,
      main: blog.main,
      keywords: blog.keywordTagMaps as Blog["keywords"],
      createdAt: toUnixTime(blog.createdAt),
    }));
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

    return {
      id: blog.id,
      name: blog.name,
      url: blog.url,
      rss: blog.rss,
      main: blog.main,
      keywords: blog.keywordTagMaps as Blog["keywords"],
      createdAt: toUnixTime(blog.createdAt),
    };
  },
});
