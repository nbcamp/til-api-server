import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "prisma";
import { HttpError } from "utils/http";
import { CursorBasedPagination } from "utils/pagination";

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

export async function findAuthUser(id: number) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          followings: true,
          blogs: true,
        },
      },
    },
  });
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
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          followings: true,
        },
      },
    },
  });
}

export function create(input: {
  username?: string | null;
  avatarUrl?: string | null;
  provider: string;
  providerId: string;
}) {
  return prisma.user.create({
    data: { ...input },
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          followings: true,
          blogs: true,
        },
      },
    },
  });
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
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          followings: true,
          blogs: true,
        },
      },
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
    },
  });
}

export function sync(id: number) {
  return prisma.user.update({
    where: { id },
    data: {
      lastSignedAt: new Date(),
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          followings: true,
          blogs: true,
        },
      },
    },
  });
}

export async function findFollowers(
  userId: number,
  pagination?: CursorBasedPagination,
) {
  const { cursor, limit, desc } = pagination ?? {};
  const followerMaps = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        include: userInclude(userId),
      },
    },
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    take: limit ?? 100,
    orderBy: { id: desc ? "desc" : "asc" },
  });
  return followerMaps.map(({ follower }) => follower);
}

export async function findFollowings(
  userId: number,
  pagination?: CursorBasedPagination,
) {
  const { cursor, limit, desc } = pagination ?? {};
  const followingMaps = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        include: userInclude(userId),
      },
    },
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    take: limit ?? 100,
    orderBy: { id: desc ? "desc" : "asc" },
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
