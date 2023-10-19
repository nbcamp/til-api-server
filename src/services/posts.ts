import { prisma } from "prisma";

export function findAllByUserId(userId: number) {
  return prisma.post.findMany({ where: { userId } });
}

export function findOneById(input: { postId: number; userId: number }) {
  return prisma.post.findFirst({
    where: { id: input.postId, userId: input.userId },
  });
}
