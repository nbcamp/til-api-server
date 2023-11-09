import { prisma } from "prisma";
import { CursorBasedPagination } from "utils/pagination";
import { userInclude } from "./users";

export async function findAll(
  pagination?: CursorBasedPagination,
  where?: { userId: number },
) {
  const q = pagination?.q?.trim();
  const { cursor, limit, desc } = pagination ?? {};
  const { userId } = where ?? {};
  const list = await prisma.post.findMany({
    where: {
      ...(q && {
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
          { postTags: { some: { tag: { contains: q } } } },
        ],
      }),
    },
    include: {
      postTags: true,
      user: {
        include: userInclude,
      },
      postLikes: {
        where: { userId },
        take: 1,
      },
    },
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    take: limit ?? 100,
    orderBy: { publishedAt: desc ? "desc" : "asc" },
  });

  return list.map((post) => ({
    ...post,
    liked: post.postLikes.length > 0,
  }));
}
