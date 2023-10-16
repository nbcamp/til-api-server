import { prisma } from "prisma";
import * as user from "./user";
import * as jwt from "@/utilities/jwt";

export const signIn = async (input: {
  username: string | null;
  profileUrl: string | null;
  provider: string | null;
  providerId: string | null;
}) => {
  if (!input.provider || !input.providerId) {
    throw new Error("공급자 정보를 제공해야 합니다.");
  }

  const foundUser = await user
    .findByProvider(input.provider, input.providerId)
    .then((node) => node ?? prisma.user.create({ data: input }))
    .then((node) => user.sync(node.id));

  return {
    accessToken: jwt.sign({ id: foundUser.id }),
  };
};
