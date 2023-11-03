import { HttpError } from "utils/http";
import { prisma } from "prisma";
import { unixTimeToDate } from "utils/datetime";
import { isBefore } from "date-fns";
import { CursorBasedPagination } from "utils/pagination";

export function findAll(
  pagination?: CursorBasedPagination,
  where?: { blogId?: number; userId?: number },
  include?: { user?: boolean },
) {
  const q = pagination?.q?.trim();
  const { cursor, limit, desc } = pagination ?? {};
  const { blogId, userId } = where ?? {};
  return prisma.post.findMany({
    where: {
      userId,
      blogId,
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
      ...(include?.user && {
        user: true,
      }),
    },
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    take: limit ?? 100,
    orderBy: { publishedAt: desc ? "desc" : "asc" },
  });
}

export function findById(
  postId: number,
  where?: { blogId?: number; userId?: number },
) {
  return prisma.post.findFirst({
    where: { id: postId, ...where },
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
  const { userId, blogId } = input;
  const blog = await prisma.blog.findUnique({ where: { id: blogId, userId } });
  if (!blog) {
    throw new HttpError("블로그를 찾을 수 없습니다.", "NOT_FOUND");
  }

  if (!input.url.includes(blog.url)) {
    throw new HttpError(
      "해당 게시글의 URL은 소유하지 않은 블로그의 주소입니다.",
      "BAD_REQUEST",
    );
  }

  if (await prisma.post.findFirst({ where: { url: input.url, userId } })) {
    throw new HttpError("이미 등록한 URL입니다.", "BAD_REQUEST");
  }

  return prisma.$transaction(async (tx) => {
    const publishedAt = unixTimeToDate(input.publishedAt);
    if (!blog.lastPublishedAt || isBefore(blog.lastPublishedAt, publishedAt)) {
      await tx.blog.update({
        where: { id: blogId, userId },
        data: { lastPublishedAt: publishedAt },
      });
    }

    const keywordMaps = await tx.keywordTagMap.findMany({
      where: { blogId: blogId },
    });

    const matched = keywordMaps.find(({ keyword }) =>
      input.title.includes(keyword),
    );

    if (!matched) {
      throw new HttpError("일치하는 키워드가 없습니다.", "BAD_REQUEST");
    }

    return tx.post.create({
      data: {
        blogId,
        userId,
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
    throw new HttpError("게시글을 찾을 수 없습니다.", "NOT_FOUND");
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
