import { createRouter } from "router";
import { blogs } from "services";
import { Blog, toBlog } from "models";
import { HttpError } from "utils/http";
import { optional } from "utils/validator";

export const getMyBlogById = createRouter({
  description: "내 블로그를 가져옵니다.",
  authorized: true,
  async handler(ctx) {
    const blog = await blogs.findById(+ctx.param.blogId, {
      userId: ctx.auth.user.id,
    });
    if (!blog) {
      throw new HttpError("블로그를 찾을 수 없습니다.", "NOT_FOUND");
    }
    return toBlog(blog);
  },
});

export const updateMyBlog = createRouter({
  description: "내 블로그를 수정합니다.",
  method: "PATCH",
  authorized: true,
  descriptor: {
    name: optional("string"),
    main: "boolean",
    keywords: optional([
      {
        keyword: "string",
        tags: ["string"],
      },
    ]),
  },
  async handler(ctx): Promise<Blog> {
    const blog = await blogs.update(
      {
        name: ctx.body.name,
        main: ctx.body.main,
        keywords: ctx.body.keywords,
      },
      {
        blogId: +ctx.param.blogId,
        userId: ctx.auth.user.id,
      },
    );
    return toBlog(blog);
  },
});

export const deleteByBlog = createRouter({
  description: "내 블로그를 삭제합니다.",
  method: "DELETE",
  authorized: true,
  async handler(ctx): Promise<boolean> {
    await blogs.remove(+ctx.param.blogId, ctx.auth.user.id);
    return true;
  },
});
