import { Post, User, toPost, toUser } from "models";
import { createRouter } from "router";
import { posts, users } from "services";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<
    {
      post: Post;
      user: User;
    }[]
  > {
    const options = {
      cursor: ctx.query.cursor ? +ctx.query.cursor : undefined,
      limit: ctx.query.limit ? +ctx.query.limit : undefined,
      desc: ctx.query.desc === "true",
      q: ctx.query.q,
    };

    const postList = await posts.findAll(options);
    const userList = await users.findByIds(postList.map((post) => post.userId));
    return postList.length
      ? postList.map((post) => {
          const user = userList.find((user) => user.id === post.userId);
          return {
            post: toPost(post),
            user: toUser(user!),
          };
        })
      : [];
  },
});
