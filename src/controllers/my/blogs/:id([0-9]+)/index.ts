import { toBlog } from "models";
import { createRouter } from "router";
import { blogs } from "services";
import { HttpError } from "utils/http";

export const getMyBlogById = createRouter({
  description: "내 블로그를 가져옵니다.",
  authorized: true,
  async handler(ctx) {
    const blog = await blogs.findById({
      blogId: +ctx.param.id,
      userId: ctx.auth.user.id,
    });
    if (!blog) {
      throw new HttpError("블로그를 찾을 수 없습니다.", "NOT_FOUND");
    }
    return toBlog(blog);
  },
});
