import { createRouter } from "router";
import { posts } from "services";
import { Post, toPost } from "models";

export const CREATE = createRouter({
  method: "POST",
  authorized: true,
  descriptor: {
    blogId: "number",
    title: "string",
    content: "string",
    url: "string",
    publishedAt: "number",
  },
  async handler(ctx): Promise<Post> {
    const post = await posts.create({
      ...ctx.body,
      userId: ctx.auth.user.id,
    });
    return toPost(post);
  },
});
