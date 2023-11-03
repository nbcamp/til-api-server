import { createRouter } from "router";
import { posts } from "services";
import { Post, toPost } from "models";
import { normalizePaginationQuery } from "utils/pagination";

export const getMyPosts = createRouter({
  description: "내 게시글 목록을 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<Post[]> {
    const options = normalizePaginationQuery(ctx.query);
    const list = await posts.findAll(options, { userId: ctx.auth.user.id });
    return list.map(toPost);
  },
});
