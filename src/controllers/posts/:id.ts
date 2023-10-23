import { createRouter } from "router";
import { HttpError } from "utils/http";
import { optional } from "utils/validator";
import { toUnixTime } from "utils/unixtime";

import * as posts from "services/posts";

import { Post } from "models/Post";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<Post> {
    const post = await posts.findOneById({
      postId: +ctx.param.id,
      userId: ctx.auth.user.id,
    });
    if (!post) {
      throw new HttpError("Not found", "NOT_FOUND");
    }
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      url: post.url,
      publishedAt: toUnixTime(post.publishedAt),
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
  async handler(ctx): Promise<Post> {
    const post = await posts.update(+ctx.param.id, {
      url: ctx.body.url,
      tags: ctx.body.tags,
    });
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      url: post.url,
      publishedAt: toUnixTime(post.publishedAt),
    };
  },
});
