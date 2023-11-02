import { createRouter } from "router";
import { blogs } from "services";
import { toBlog } from "models";

export const getMyBlogs = createRouter({
  description: "내 블로그 목록을 가져옵니다.",
  authorized: true,
  async handler(ctx) {
    const list = await blogs.findAllByUserId(ctx.auth.user.id);
    return list.map(toBlog);
  },
});
