import { createRouter } from "router";
import { toUnixTime } from "utils/unixtime";

import * as posts from "services/posts";

import { Post } from "models/Post";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<Post[]> {
    const options = {
      userId: ctx.query.mode === "public" ? undefined : ctx.auth.user.id,
      cursor: ctx.query.cursor ? +ctx.query.cursor : undefined,
      limit: ctx.query.limit ? +ctx.query.limit : undefined,
      desc: ctx.query.desc === "true",
    };

    const list = await posts.findAll(options);
    return list.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      url: post.url,
      tags: post.postTags.map(({ tag }) => tag),
      publishedAt: toUnixTime(post.publishedAt),
    }));
  },
});
