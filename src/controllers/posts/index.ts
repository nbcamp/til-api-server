import { createRouter } from "router";
import { toUnixTime } from "@/utils/unixtime";

import * as posts from "services/posts";

export default createRouter({
  authorized: true,
  async handler(ctx) {
    const list = await posts.findAllByUserId(ctx.auth.user.id);
    return {
      items: list.map((post) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        url: post.url,
        publishedAt: toUnixTime(post.publishedAt),
      })),
    };
  },
});
