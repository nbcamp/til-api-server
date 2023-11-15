import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "prisma";
import { HttpError } from "utils/http";

// TODO: AuthUser Context 전달하도록 개선
export const userInclude = (authUserId: number): Prisma.UserInclude => ({
  _count: {
    select: {
      posts: true,
      followers: true,
      followings: true,
      blogs: true,
    },
  },
  blogs: {
    select: {
      lastPublishedAt: true,
    },
    orderBy: {
      lastPublishedAt: "desc",
    },
    take: 1,
  },
  followers: {
    where: { followerId: authUserId },
    take: 1,
  },
  followings: {
    where: { followingId: authUserId },
    take: 1,
  },
});

export const authUserInclude = (authUserId: number): Prisma.UserInclude => ({
  _count: {
    select: {
      posts: true,
      followers: {
        where: {
          follower: {
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
      followings: {
        where: {
          following: {
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
      blogs: true,
    },
  },
  blogs: {
    select: {
      lastPublishedAt: true,
    },
    orderBy: {
      lastPublishedAt: "desc",
    },
    take: 1,
  },
});

export async function checkAuthorized(id: number) {
  try {
    return await prisma.user.findUniqueOrThrow({
      where: { id, deletedAt: null },
      select: { id: true },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new HttpError("사용자 정보를 찾을 수 없습니다.", "NOT_FOUND");
      }
    }
    throw error;
  }
}

export async function findAuthUser(id: number) {
  try {
    return await prisma.user.findUniqueOrThrow({
      where: { id },
      include: authUserInclude(id),
    });
  } catch {
    throw new HttpError("사용자 정보를 찾을 수 없습니다.", "NOT_FOUND");
  }
}

export async function findById(authUserId: number, userId: number) {
  try {
    return await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: userInclude(authUserId),
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new HttpError("해당 사용자를 찾을 수 없습니다.", "NOT_FOUND");
      }
    }
    throw error;
  }
}

export async function findByProvider(provider: string, providerId: string) {
  return prisma.user.findUnique({
    where: {
      providerIndex: {
        provider,
        providerId,
      },
    },
  });
}

export async function create(input: {
  username?: string | null;
  avatarUrl?: string | null;
  provider: string;
  providerId: string;
}) {
  const user = await prisma.user.create({
    data: input,
  });
  if (!user.username) {
    await prisma.user.update({
      where: { id: user.id },
      data: { username: `user-${user.id}` },
    });
  }
  return user;
}

export function update(
  id: number,
  input: {
    name?: string | null;
    avatarUrl?: string | null;
  },
) {
  return prisma.user.update({
    where: { id },
    data: input,
    include: authUserInclude(id),
  });
}

export function sync(id: number) {
  return prisma.user.update({
    where: { id },
    data: {
      lastSignedAt: new Date(),
      deletedAt: null,
    },
  });
}

export async function remove(id: number) {
  return prisma.user.update({
    where: { id },
    data: {
      providerId: null,
      deletedAt: new Date(),
      blogs: {
        deleteMany: {},
      },
      followers: {
        deleteMany: {},
      },
      followings: {
        deleteMany: {},
      },
    },
  });
}

export async function findFollowers(
  authUserId: number,
  where: { userId: number },
  pagination?: CursorBasedPagination,
) {
  const { cursor, limit, sort } = pagination ?? {};
  const followerMaps = await prisma.follow.findMany({
    where: {
      following: {
        id: where.userId,
        deletedAt: null,
      },
      follower: {
        blockeds: {
          every: {
            blockerId: {
              not: authUserId,
            },
          },
        },
      },
    },
    include: {
      follower: {
        include: userInclude(authUserId),
      },
    },
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    take: limit ?? 100,
    orderBy: { id: sort },
  });
  return followerMaps.map(({ follower }) => follower);
}

export async function findFollowings(
  authUserId: number,
  where: { userId: number },
  pagination?: CursorBasedPagination,
) {
  const { cursor, limit, sort } = pagination ?? {};
  const followingMaps = await prisma.follow.findMany({
    where: {
      follower: {
        id: where.userId,
        deletedAt: null,
      },
      following: {
        blockeds: {
          every: {
            blockerId: {
              not: authUserId,
            },
          },
        },
      },
    },
    include: {
      following: {
        include: userInclude(authUserId),
      },
    },
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    take: limit ?? 100,
    orderBy: { id: sort },
  });
  return followingMaps.map(({ following }) => following);
}

export async function follow(fromId: number, toId: number) {
  const follow = await prisma.follow.findFirst({
    where: { followerId: fromId, followingId: toId },
  });

  if (follow) {
    return null;
  }

  await prisma.follow.create({
    data: {
      followerId: fromId,
      followingId: toId,
    },
  });

  return prisma.user.findUnique({
    where: { id: toId },
    include: userInclude(fromId),
  });
}

export async function unfollow(fromId: number, toId: number) {
  const follow = await prisma.follow.findFirst({
    where: { followerId: fromId, followingId: toId },
  });

  if (!follow) {
    return null;
  }

  await prisma.follow.delete({
    where: {
      followerFollowingIndex: {
        followerId: fromId,
        followingId: toId,
      },
    },
  });

  return prisma.user.findUnique({
    where: { id: toId },
    include: userInclude(fromId),
  });
}
