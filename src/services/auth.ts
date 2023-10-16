import { prisma } from "prisma";
import * as users from "./users";
import * as jwt from "@/utilities/jwt";
import { HttpError } from "@/utilities/error";

export async function signIn(input: {
  username: string | null;
  profileUrl: string | null;
  provider: string | null;
  providerId: string | null;
}) {
  if (!input.provider || !input.providerId) {
    throw new HttpError("공급자 정보를 제공해야 합니다.", "BAD_REQUEST");
  }

  const foundUser = await users
    .findByProvider(input.provider, input.providerId)
    .then((node) => node ?? prisma.user.create({ data: input }))
    .then((node) => users.sync(node.id));

  return {
    accessToken: jwt.sign({ id: foundUser.id }),
  };
}
