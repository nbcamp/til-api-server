import { createRouter } from "router";
import { toUnixTime } from "utils/unixtime";

import * as posts from "services/posts";

import { Post } from "models/Post";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<Post[]> {
    const list = await posts.findAllByUserId(ctx.auth.user.id);
    return list.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      url: post.url,
      publishedAt: toUnixTime(post.publishedAt),
    }));
  },
});
