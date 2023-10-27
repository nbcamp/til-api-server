import { prisma } from "prisma";

export async function findById(id: number) {
  return prisma.user.findUnique({ where: { id } });
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

export function create(input: {
  username?: string | null;
  avatarUrl?: string | null;
  provider: string;
  providerId: string;
}) {
  return prisma.user.create({
    data: { ...input },
  });
}

export function update(
  id: number,
  input: {
    name?: string | null;
    avatarUrl?: string | null;
  },
) {
  return prisma.user.update({ where: { id }, data: input });
}

export async function remove(id: number) {
  return prisma.user.update({
    where: { id },
    data: {
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
  });
}

export async function findFollowers(input: {
  userId: number;
  cursor?: number;
  limit?: number;
  desc?: boolean;
}) {
  const followerMaps = await prisma.follow.findMany({
    where: { followingId: input.userId },
    include: { follower: true },
    ...(input.cursor && {
      cursor: { id: input.cursor },
      skip: 1,
    }),
    take: input.limit ?? 100,
    orderBy: { id: input.desc ? "desc" : "asc" },
  });
  return followerMaps.map(({ follower }) => follower);
}

export async function findFollowings(input: {
  userId: number;
  cursor?: number;
  limit?: number;
  desc?: boolean;
}) {
  const followingMaps = await prisma.follow.findMany({
    where: { followerId: input.userId },
    include: { following: true },
    ...(input.cursor && {
      cursor: { id: input.cursor },
      skip: 1,
    }),
    take: input.limit ?? 100,
    orderBy: { id: input.desc ? "desc" : "asc" },
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

  return prisma.follow.create({
    data: {
      followerId: fromId,
      followingId: toId,
    },
  });
}

export async function unfollow(fromId: number, toId: number) {
  const follow = await prisma.follow.findFirst({
    where: { followerId: fromId, followingId: toId },
  });

  if (!follow) {
    return null;
  }

  return prisma.follow.delete({
    where: {
      followerFollowingIndex: {
        followerId: fromId,
        followingId: toId,
      },
    },
  });
}
