import { createRouter } from "router";
import { posts, users } from "services";
import { Post, User, toPost, toUser } from "models";
import { normalizePaginationQuery } from "utils/pagination";

interface CommunityPost extends Exclude<Post, "userId"> {
  user: User;
}

export const getCommunityPosts = createRouter({
  description: "커뮤니티 게시글 목록을 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<CommunityPost[]> {
    const options = normalizePaginationQuery(ctx.query);
    const postList = await posts.findAll(options, {}, { user: true });
    return Promise.all(
      postList.map(async (post) => ({
        ...toPost(post),
        user: toUser(await users.withMetrics(post.user)),
      })),
    );
  },
});
