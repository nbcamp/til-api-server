import { createRouter } from "router";
import { posts } from "services";
import { Post, toPost } from "models";

import { HttpError } from "utils/http";

export const getMyPostByBlog = createRouter({
  description: "내 블로그의 게시글을 가져옵니다.",
  authorized: true,
  async handler(ctx): Promise<Post> {
    console.log(ctx.param);
    const post = await posts.findById(+ctx.param.postId, {
      userId: ctx.auth.user.id,
      blogId: +ctx.param.blogId,
    });
    if (!post) {
      throw new HttpError("게시글을 찾을 수 없습니다.", "NOT_FOUND");
    }
    return toPost(post);
  },
});
