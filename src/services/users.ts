import { prisma } from "prisma";
import { CursorBasedPagination } from "utils/pagination";

export async function findById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export async function findByIds(ids: number[]) {
  return prisma.user.findMany({ where: { id: { in: ids } } });
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

export function withMetrics<User extends { id: number }>(user: User) {
  return prisma.$transaction(async (tx) => {
    const [posts, followers, followings] = await Promise.all([
      tx.post.count({ where: { userId: user.id } }),
      tx.follow.count({ where: { followingId: user.id } }),
      tx.follow.count({ where: { followerId: user.id } }),
    ]);

    return { ...user, posts, followers, followings };
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

export async function findFollowers(
  pagination?: CursorBasedPagination,
  where?: { userId: number },
) {
  const { cursor, limit, desc } = pagination ?? {};
  const followerMaps = await prisma.follow.findMany({
    where: { followingId: where?.userId },
    include: { follower: true },
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
  pagination?: CursorBasedPagination,
  where?: { userId: number },
) {
  const { cursor, limit, desc } = pagination ?? {};
  const followingMaps = await prisma.follow.findMany({
    where: { followerId: where?.userId },
    include: { following: true },
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
