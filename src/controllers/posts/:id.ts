import { createRouter } from "router";
import { optional } from "@/utils/validator";
import { toUnixTime } from "@/utils/unixtime";

import * as posts from "services/posts";

export default createRouter({
  authorized: true,
  async handler(ctx) {
    const post = await posts.findOneById({
      postId: +ctx.param.id,
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

export const UPDATE = createRouter({
  method: "PATCH",
  authorized: true,
  descriptor: {
    url: optional("string"),
    tags: optional(["string"]),
  },
  async handler(ctx) {
    const result = await posts.update(+ctx.param.id, {
      url: ctx.body.url,
      tags: ctx.body.tags,
    });
    return {
      id: result.id,
    };
  },
});
