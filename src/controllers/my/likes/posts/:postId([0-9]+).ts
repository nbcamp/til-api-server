import { createRouter } from "router";
import { likes } from "services";

export const likePost = createRouter({
  description: "포스트에 좋아요를 합니다.",
  method: "POST",
  authorized: true,
  async handler(ctx): Promise<boolean> {
    await likes.likePost({
      postId: +ctx.param.postId,
      userId: ctx.auth.user.id,
    });
    return true;
  },
});

export const unlikePost = createRouter({
  description: "포스트에 좋아요를 취소합니다.",
  method: "DELETE",
  authorized: true,
  async handler(ctx): Promise<boolean> {
    await likes.unlikePost({
      postId: +ctx.param.postId,
      userId: ctx.auth.user.id,
    });
    return true;
  },
});
