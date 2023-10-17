import { createRouter } from "router";
import * as blogs from "services/blogs";

export default createRouter({
  authorized: true,
  async handler(ctx) {
    const blog = await blogs.findOneById(+ctx.param.id);
    return {
      item: blog,
    };
  },
});

export const UPDATE = createRouter({
  method: "PATCH",
  authorized: true,
  descriptor: {
    name: "string optional",
    primary: "boolean optional",
  },
  async handler(ctx) {
    const result = await blogs.update(+ctx.param.id, {
      name: ctx.body.name,
      primary: ctx.body.primary,
      ownerId: ctx.auth.user.id,
    });
    return {
      id: result.id,
    };
  },
});

export const DELETE = createRouter({
  method: "DELETE",
  authorized: true,
  async handler(ctx) {
    await blogs.remove(+ctx.param.id);
    return {
      ok: true,
    };
  },
});
