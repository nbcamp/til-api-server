import { createRouter } from "router";
import { HttpError } from "utils/http";
import { toUnixTime } from "utils/unixtime";

import * as blogs from "services/blogs";

import { Blog } from "models/Blog";

export const GET = createRouter({
  authorized: true,
  async handler(ctx): Promise<Blog> {
    const blog = await blogs.findMainByUserId(ctx.auth.user.id);
    if (!blog) {
      throw new HttpError("Not found", "NOT_FOUND");
    }
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
