import { HttpError } from "utils/http";
import { prisma } from "prisma";
import { unixTimeToDate } from "utils/datetime";
import { isBefore } from "date-fns";

export function findAll(input: {
  userId?: number;
  cursor?: number;
  limit?: number;
  desc?: boolean;
  q?: string;
}) {
  const q = input.q?.trim();
  return prisma.post.findMany({
    where: {
      userId: input.userId,
      ...(q && {
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
          { postTags: { some: { tag: { contains: q } } } },
        ],
      }),
    },
    include: { postTags: true },
    ...(input.cursor && {
      cursor: { id: input.cursor },
      skip: 1,
    }),
    take: input.limit ?? 100,
    orderBy: { publishedAt: input.desc ? "desc" : "asc" },
  });
}

export function findOneById(input: { postId: number; userId: number }) {
  return prisma.post.findFirst({
    where: { id: input.postId, userId: input.userId },
    include: { postTags: true },
  });
}

export async function create(input: {
  userId: number;
  blogId: number;
  title: string;
  content: string;
  url: string;
  publishedAt: number;
}) {
  const blog = await prisma.blog.findUnique({ where: { id: input.blogId } });

  if (!blog) {
    throw new HttpError("블로그를 찾을 수 없습니다.", "NOT_FOUND");
  }

  if (!input.url.includes(blog.url)) {
    throw new HttpError(
      "해당 TIL의 URL은 소유하지 않은 블로그의 주소입니다.",
      "BAD_REQUEST",
    );
  }

  if (await prisma.post.findFirst({ where: { url: input.url } })) {
    throw new HttpError("이미 등록한 URL입니다.", "BAD_REQUEST");
  }

  return prisma.$transaction(async (tx) => {
    const publishedAt = unixTimeToDate(input.publishedAt);
    if (!blog.lastPublishedAt || isBefore(blog.lastPublishedAt, publishedAt)) {
      await tx.blog.update({
        where: { id: input.blogId },
        data: { lastPublishedAt: publishedAt },
      });
    }

    const keywordMaps = await tx.keywordTagMap.findMany({
      where: { blogId: input.blogId },
    });

    const matched = keywordMaps.find(({ keyword }) =>
      input.title.includes(keyword),
    );

    if (!matched) {
      throw new HttpError("일치하는 키워드가 없습니다.", "BAD_REQUEST");
    }

    return tx.post.create({
      data: {
        blogId: input.blogId,
        userId: input.userId,
        title: input.title,
        content: input.content,
        url: input.url,
        postTags: {
          create: (matched.tags as string[]).map((tag) => ({ tag })),
        },
        publishedAt,
      },
      include: { postTags: true },
    });
  });
}

export async function update(
  id: number,
  input: {
    url?: string;
    tags?: string[];
  },
) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { blog: true },
  });

  if (!post) {
    throw new HttpError("Not found", "NOT_FOUND");
  }

  if (await prisma.post.findFirst({ where: { url: input.url } })) {
    throw new HttpError("이미 등록한 URL입니다.", "BAD_REQUEST");
  }

  if (!input.url?.includes(post.blog.url)) {
    throw new HttpError(
      "해당 TIL의 URL은 소유하지 않은 블로그의 주소입니다.",
      "BAD_REQUEST",
    );
  }

  return prisma.$transaction(async (tx) => {
    if (input.tags?.length) {
      await tx.blog.update({
        where: { id: post.blogId },
        data: {
          lastPublishedAt: null,
        },
      });
    }

    return prisma.post.update({
      where: { id },
      data: {
        url: input.url,
        postTags: {
          deleteMany: {},
          create: input.tags?.map((tag) => ({ tag })),
        },
      },
      include: {
        postTags: true,
      },
    });
  });
}
