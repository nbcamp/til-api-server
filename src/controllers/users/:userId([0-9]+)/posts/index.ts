import { createRouter } from "router";
import { posts } from "services";
import { Post, toPost } from "models";
import { normalizePaginationQuery } from "utils/pagination";

export const getUserPosts = createRouter({
  description: "사용자의 게시글 목록을 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<Post[]> {
    const options = normalizePaginationQuery(ctx.query);
    const list = await posts.findAll(options, { userId: +ctx.param.userId });
    return list.map(toPost);
  },
});
