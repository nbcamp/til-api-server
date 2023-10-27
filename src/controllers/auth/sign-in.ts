import { createRouter } from "router";
import { jwt, users } from "services";
import { Auth, toUser } from "models";

import { HttpError } from "utils/http";
import { nullable, optional } from "utils/validator";

export default createRouter({
  method: "POST",
  descriptor: {
    provider: "string",
    providerId: "string",
    username: optional(nullable("string")),
    avatarUrl: optional(nullable("string")),
  },
  async handler(ctx): Promise<Auth> {
    const input = ctx.body;
    if (!input.provider || !input.providerId) {
      throw new HttpError("공급자 정보를 제공해야 합니다.", "BAD_REQUEST");
    }

    const user = await users
      .findByProvider(input.provider, input.providerId)
      .then((user) => user ?? users.create(input))
      .then((user) => users.sync(user.id));

    return {
      accessToken: jwt.sign({ id: user.id }),
      user: toUser(user),
    };
  },
});
