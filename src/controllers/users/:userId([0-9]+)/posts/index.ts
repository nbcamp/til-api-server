import { createRouter } from "router";
import { posts } from "services";
import { Post, toPost } from "models";

export const getUserPosts = createRouter({
  description: "사용자의 게시글 목록을 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<Post[]> {
    const list = await posts.findAll(ctx.auth.user.id, {
      userId: +ctx.param.userId,
    });
    return list.map(toPost);
  },
});
