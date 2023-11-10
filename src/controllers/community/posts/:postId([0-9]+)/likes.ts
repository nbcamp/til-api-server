import { createRouter } from "router";
import { likes } from "services";
import { Post, toPost } from "models";

export const likePost = createRouter({
  description: "게시글에 좋아요를 합니다.",
  method: "POST",
  authorized: true,
  async handler(ctx): Promise<Post> {
    const post = await likes.likePost({
      postId: +ctx.param.postId,
      userId: ctx.auth.user.id,
    });
    return toPost(post);
  },
});

export const unlikePost = createRouter({
  description: "게시글에 좋아요를 취소합니다.",
  method: "DELETE",
  authorized: true,
  async handler(ctx): Promise<Post> {
    const post = await likes.unlikePost({
      postId: +ctx.param.postId,
      userId: ctx.auth.user.id,
    });
    return toPost(post);
  },
});
