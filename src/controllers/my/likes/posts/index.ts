import { createRouter } from "router";
import { likes } from "services";
import { Post, toPost } from "models";
import { normalizePaginationQuery } from "utils/pagination";

export const getMyPostLikes = createRouter({
  description: "내가 좋아요한 포스트를 조회합니다.",
  method: "GET",
  authorized: true,
  async handler(ctx): Promise<Post[]> {
    const options = normalizePaginationQuery(ctx.query);
    const list = await likes.findAllPosts(options, {
      userId: ctx.auth.user.id,
    });
    return list.map(({ post }) => toPost(post));
  },
});
