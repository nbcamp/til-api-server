import { createRouter } from "router";
import { blogs } from "services";
import { Blog, toBlog } from "models";

export const getUserBlogs = createRouter({
  description: "사용자의 블로그 목록을 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<Blog[]> {
    const list = await blogs.findAll({ userId: +ctx.param.userId });
    return list.map(toBlog);
  },
});
