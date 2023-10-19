import { createRouter } from "router";
import { toUnixTime } from "@/utils/unixtime";

import * as posts from "services/posts";

export default createRouter({
  authorized: true,
  async handler(ctx) {
    const post = await posts.findOneById({
      postId: Number(ctx.param.id),
      userId: ctx.auth.user.id,
    });
    return {
      item: post
        ? {
            id: post.id,
            title: post.title,
            description: post.description,
            url: post.url,
            publishedAt: toUnixTime(post.publishedAt),
          }
        : null,
    };
  },
});
