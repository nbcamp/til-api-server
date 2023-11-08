import { createRouter } from "router";
import { likes } from "services";
import { Post, RawCommunityPost, toCommunityPost } from "models";
import { normalizePaginationQuery } from "utils/pagination";

export const getMyLikedPosts = createRouter({
  description: "내가 좋아요한 게시글 목록을 불러옵니다.",
  authorized: true,
  async handler(ctx): Promise<Post[]> {
    const options = normalizePaginationQuery(ctx.query);
    const list = await likes.findAllPosts(
      options,
      {
        userId: ctx.auth.user.id,
      },
      { user: true },
    );
    return Promise.all(
      list.map(({ post }) =>
        toCommunityPost(post as unknown as RawCommunityPost),
      ),
    );
  },
});
