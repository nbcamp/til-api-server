import { createRouter } from "router";
import { blogs } from "services";
import { Blog, toBlog } from "models";

import { HttpError } from "utils/http";
import { optional } from "utils/validator";

export default createRouter({
  authorized: true,
  async handler(ctx): Promise<Blog> {
    const blog = await blogs.findOneById({
      blogId: +ctx.param.id,
      userId: ctx.auth.user.id,
    });
    if (!blog) throw new HttpError("블로그를 찾을 수 없습니다.", "NOT_FOUND");
    return toBlog(blog);
  },
});

export const UPDATE = createRouter({
  method: "PATCH",
  authorized: true,
  descriptor: {
    name: optional("string"),
    keywords: optional([
      {
        keyword: "string",
        tags: ["string"],
      },
    ]),
  },
  async handler(ctx): Promise<Blog> {
    const blog = await blogs.update(+ctx.param.id, {
      name: ctx.body.name,
      userId: ctx.auth.user.id,
      keywords: ctx.body.keywords,
    });
    return toBlog(blog);
  },
});

export const DELETE = createRouter({
  method: "DELETE",
  authorized: true,
  async handler(ctx): Promise<boolean> {
    await blogs.remove({
      blogId: +ctx.param.id,
      userId: ctx.auth.user.id,
    });
    return true;
  },
});
