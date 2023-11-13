import { prisma } from "prisma";
import { CursorBasedPagination } from "utils/pagination";
import { userInclude } from "./users";

export async function findAll(
  authUserId: number,
  pagination?: CursorBasedPagination,
) {
  const q = pagination?.q?.trim();
  const { cursor, limit, sort } = pagination ?? {};
  const list = await prisma.post.findMany({
    where: {
      ...(q && {
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
          { postTags: { some: { tag: { contains: q } } } },
        ],
      }),
      user: {
        blockeds: {
          none: {
            blockerId: authUserId,
          },
        },
      },
    },
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
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    take: limit ?? 100,
    orderBy: {
      publishedAt: sort,
    },
  });

  return list.map((post) => ({
    ...post,
    liked: post.postLikes.length > 0,
  }));
}
