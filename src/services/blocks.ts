import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "prisma";
import { HttpError } from "utils/http";

export async function findAll(userId: number) {
  const blocks = await prisma.userBlock.findMany({
    where: { blockerId: userId },
    include: {
      blocked: true,
    },
  });

  return blocks.map((block) => block.blocked);
}

export async function block(fromUserId: number, toUserId: number) {
  try {
    return await prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.follow.deleteMany({
          where: {
            OR: [
              {
                followerId: fromUserId,
                followingId: toUserId,
              },
              {
                followerId: toUserId,
                followingId: fromUserId,
              },
            ],
          },
        }),
        tx.postLike.deleteMany({
          where: {
            userId: fromUserId,
            post: {
              userId: toUserId,
            },
          },
        }),
      ]);
      const blockedUser = await prisma.userBlock.create({
        data: {
          blockerId: fromUserId,
          blockedId: toUserId,
        },
        include: {
          blocked: true,
        },
      });

      return blockedUser.blocked;
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new HttpError("이미 차단한 사용자입니다.", "CONFLICT");
      }
      if (error.code === "P2025") {
        throw new HttpError("차단할 수 없는 사용자입니다.", "BAD_REQUEST");
      }
    }
    throw error;
  }
}

export async function unblock(fromUserId: number, toUserId: number) {
  try {
    const blockedUser = await prisma.userBlock.delete({
      where: {
        userBlockIndex: {
          blockerId: fromUserId,
          blockedId: toUserId,
        },
      },
      include: {
        blocked: true,
      },
    });

    return blockedUser.blocked;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002" || error.code === "P2025") {
        throw new HttpError("차단을 해제할 수 없습니다.", "CONFLICT");
      }
    }
    throw error;
  }
}
