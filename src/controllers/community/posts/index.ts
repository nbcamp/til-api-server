import { createRouter } from "router";
import { community } from "services";
import { CommunityPost, toCommunityPost } from "models";
import { normalizePaginationQuery } from "utils/pagination";

export const getCommunityPosts = createRouter({
  description: "커뮤니티 게시글 목록을 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<CommunityPost[]> {
    const option = normalizePaginationQuery(ctx.query);
    const postList = await community.findAll(option, {
      userId: ctx.auth.user.id,
    });
    return Promise.all(postList.map(toCommunityPost));
  },
});
