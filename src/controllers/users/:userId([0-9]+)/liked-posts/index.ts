import { createRouter } from "router";
import { likes, users } from "services";
import { Post, toPost, toUser } from "models";
import { normalizePaginationQuery } from "utils/pagination";

export const getUserLikedPosts = createRouter({
  description: "사용자가 좋아요한 게시글을 조회합니다.",
  method: "GET",
  authorized: true,
  async handler(ctx): Promise<Post[]> {
    const options = normalizePaginationQuery(ctx.query);
    const list = await likes.findAllPosts(options, {
      userId: +ctx.param.userId,
    });
    return Promise.all(
      list.map(async ({ post }) => ({
        ...toPost(post),
        user: toUser(await users.withMetrics(post.user)),
      })),
    );
  },
});
