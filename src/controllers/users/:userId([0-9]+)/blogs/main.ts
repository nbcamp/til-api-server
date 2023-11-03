import { createRouter } from "router";
import { blogs } from "services";
import { Blog, toBlog } from "models";

export const getUserMainBlog = createRouter({
  description: "사용자의 메인 블로그를 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<Blog> {
    const blog = await blogs.findMainByUserId(+ctx.param.userId);
    return toBlog(blog);
  },
});
