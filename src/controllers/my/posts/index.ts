import { createRouter } from "router";
import { posts } from "services";
import { Post, toPost } from "models";

export const getMyPosts = createRouter({
  description: "내 게시글 목록을 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<Post[]> {
    const list = await posts.findAll(ctx.auth.user.id, {
      userId: ctx.auth.user.id,
    });
    return list.map(toPost);
  },
});
