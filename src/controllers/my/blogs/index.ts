import { createRouter } from "router";
import { blogs } from "services";
import { Blog, toBlog } from "models";

export const getMyBlogs = createRouter({
  description: "내 블로그 목록을 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<Blog[]> {
    const list = await blogs.findAll({ userId: ctx.auth.user.id });
    return list.map(toBlog);
  },
});

export const createMyBlog = createRouter({
  description: "내 블로그를 생성합니다.",
  method: "POST",
  authorized: true,
  descriptor: {
    name: "string",
    url: "string",
    rss: "string",
    keywords: [
      {
        keyword: "string",
        tags: ["string"],
      },
    ],
  },
  async handler(ctx): Promise<Blog> {
    const blog = await blogs.create({
      ...ctx.body,
      userId: ctx.auth.user.id,
    });

    return toBlog(blog);
  },
});
