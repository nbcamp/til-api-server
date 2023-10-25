import { createRouter } from "router";
import { posts } from "services";
import { Post, toPost } from "models";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<Post[]> {
    const options = {
      userId: ctx.query.userId ? +ctx.query.userId : undefined,
      cursor: ctx.query.cursor ? +ctx.query.cursor : undefined,
      limit: ctx.query.limit ? +ctx.query.limit : undefined,
      desc: ctx.query.desc === "true",
      q: ctx.query.q,
    };

    const list = await posts.findAll(options);
    return list.map(toPost);
  },
});

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
