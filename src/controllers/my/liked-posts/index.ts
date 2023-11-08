import { createRouter } from "router";
import { likes, users } from "services";
import { Post, toPost, toUser } from "models";
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
      list.map(async ({ post }) => ({
        ...toPost(post),
        user: toUser(await users.withMetrics(post.user)),
      })),
    );
  },
});
