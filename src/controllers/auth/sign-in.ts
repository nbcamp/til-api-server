import { createRouter } from "router";
import * as users from "@/services/users";
import * as jwt from "@/services/jwt";
import { HttpError } from "@/utilities/error";

export default createRouter({
  method: "POST",
  descriptor: {
    username: "string nullable",
    avatarUrl: "string nullable",
    provider: "string nullable",
    providerId: "string nullable",
  },
  async handler(ctx) {
    const input = ctx.body;
    if (!input.provider || !input.providerId) {
      throw new HttpError("공급자 정보를 제공해야 합니다.", "BAD_REQUEST");
    }

    const foundUser = await users
      .findByProvider(input.provider, input.providerId)
      .then((node) => node ?? users.create(input))
      .then((node) => users.sync(node.id));

    return {
      accessToken: jwt.sign({ id: foundUser.id }),
    };
  },
});
