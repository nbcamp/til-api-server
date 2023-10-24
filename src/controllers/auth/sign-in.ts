import { createRouter } from "router";
import { HttpError } from "utils/http";
import { nullable } from "utils/validator";

import * as users from "services/users";
import * as jwt from "services/jwt";

import { Auth } from "models/Auth";

export default createRouter({
  method: "POST",
  descriptor: {
    username: nullable("string"),
    avatarUrl: nullable("string"),
    provider: "string",
    providerId: "string",
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
    };
  },
});
