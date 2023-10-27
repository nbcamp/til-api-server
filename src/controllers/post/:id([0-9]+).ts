import { createRouter } from "router";
import { posts } from "services";
import { Post, toPost } from "models";

import { HttpError } from "utils/http";
import { optional } from "utils/validator";

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
    return toPost(post);
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
    return toPost(post);
  },
});
