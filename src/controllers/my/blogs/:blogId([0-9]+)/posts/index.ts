import { createRouter } from "router";
import { posts } from "services";
import { Post, toPost } from "models";

export const getMyPostsByBlog = createRouter({
  description: "내 블로그의 글 목록을 가져옵니다.",
  authorized: true,
  async handler(ctx) {
    const list = await posts.findAll({
      userId: ctx.auth.user.id,
      blogId: +ctx.param.blogId,
    });
    return list.map(toPost);
  },
});

export const createMyPostByBlog = createRouter({
  description: "내 블로그에 글을 추가합니다.",
  method: "POST",
  authorized: true,
  descriptor: {
    title: "string",
    content: "string",
    url: "string",
    publishedAt: "number",
  },
  async handler(ctx): Promise<Post> {
    const post = await posts.create({
      ...ctx.body,
      blogId: +ctx.param.blogId,
      userId: ctx.auth.user.id,
    });
    return toPost(post);
  },
});
