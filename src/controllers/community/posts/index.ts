import { createRouter } from "router";
import { posts } from "services";
import { CommunityPost, RawCommunityPost, toCommunityPost } from "models";
import { normalizePaginationQuery } from "utils/pagination";

export const getCommunityPosts = createRouter({
  description: "커뮤니티 게시글 목록을 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<CommunityPost[]> {
    const options = normalizePaginationQuery(ctx.query);
    const postList = await posts.findAll(options, {}, { user: true });
    return Promise.all(
      postList.map((post) =>
        toCommunityPost(post as unknown as RawCommunityPost),
      ),
    );
  },
});
