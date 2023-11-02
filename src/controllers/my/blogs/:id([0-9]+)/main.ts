import { createRouter } from "router";
import { blogs } from "services";
import { Blog, toBlog } from "models";

export const setMyMainBlog = createRouter({
  description: "내 메인 블로그를 설정합니다.",
  method: "PATCH",
  authorized: true,
  async handler(ctx): Promise<Blog> {
    const blog = await blogs.update(+ctx.param.id, {
      userId: ctx.auth.user.id,
      main: true,
    });
    return toBlog(blog);
  },
});
