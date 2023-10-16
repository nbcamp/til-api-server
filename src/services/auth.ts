import { prisma } from "prisma";
import * as users from "./user";
import * as jwt from "@/utilities/jwt";

export async function signIn(input: {
  username: string | null;
  profileUrl: string | null;
  provider: string | null;
  providerId: string | null;
}) {
  if (!input.provider || !input.providerId) {
    throw new Error("공급자 정보를 제공해야 합니다.");
  }

  const foundUser = await users
    .findByProvider(input.provider, input.providerId)
    .then((node) => node ?? prisma.user.create({ data: input }))
    .then((node) => users.sync(node.id));

  return {
    accessToken: jwt.sign({ id: foundUser.id }),
  };
}
