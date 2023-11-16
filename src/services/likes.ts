import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "prisma";
import { HttpError } from "utils/http";
import { CursorBasedPagination } from "utils/pagination";
import { userInclude } from "./users";

export function findAllPosts(
  authUserId: number,
  pagination?: CursorBasedPagination,
  where?: { userId?: number },
) {
  const { cursor, limit, sort } = pagination ?? {};
  const { userId } = where ?? {};
  return prisma.postLike.findMany({
    where: {
      userId,
      post: {
        user: {
          blockeds: {
            every: {
              blockerId: {
                not: authUserId,
              },
            },
          },
        },
      },
    },
    select: {
      post: {
        include: {
          postTags: true,
          user: {
            include: userInclude(authUserId),
          },
          postLikes: {
            where: { userId: authUserId },
            take: 1,
          },
        },
      },
    },
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    take: limit ?? 100,
    orderBy: { id: sort },
  });
}

export async function likePost(where: { userId: number; postId: number }) {
  try {
    const result = await prisma.postLike.create({
      data: where,
      include: {
        post: {
          include: {
            postTags: true,
            postLikes: {
              take: 1,
            },
          },
        },
      },
    });
    return result.post;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "P2002") {
        throw new HttpError("이미 좋아요한 포스트입니다.", "CONFLICT");
      }
      if (error.code === "P2003") {
        throw new HttpError("좋아요할 수 없는 포스트입니다.", "NOT_FOUND");
      }
    }
    throw error;
  }
}

export async function unlikePost(where: { userId: number; postId: number }) {
  try {
    const result = await prisma.postLike.delete({
      where: {
        postLikeIndex: {
          userId: where.userId,
          postId: where.postId,
        },
      },
      include: {
        post: {
          include: {
            postTags: true,
            postLikes: {
              take: 1,
            },
          },
        },
      },
    });
    result.post.postLikes = [];
    return result.post;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new HttpError("좋아요를 취소할 수 없습니다.", "NOT_FOUND");
      }
    }
    throw error;
  }
}
