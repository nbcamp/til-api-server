import { HttpError } from "utils/http";
import { prisma } from "prisma";

export function findAllByUserId(userId: number) {
  return prisma.blog.findMany({
    where: { userId },
    include: { keywordTagMaps: true },
  });
}

export function findMainByUserId(userId: number) {
  return prisma.blog.findFirst({
    where: { userId, main: true },
    include: { keywordTagMaps: true },
  });
}

export function findOneById(input: { blogId: number; userId: number }) {
  return prisma.blog.findFirst({
    where: { id: input.blogId, userId: input.userId },
    include: { keywordTagMaps: true },
  });
}

export async function create(input: {
  userId: number;
  name: string;
  url: string;
  rss: string;
  keywords: {
    keyword: string;
    tags: string[];
  }[];
}) {
  const blog = await prisma.blog.findFirst({
    where: { userId: input.userId, name: input.name },
  });
  if (blog) {
    throw new HttpError(
      "블로그 이름은 중복으로 생성할 수 없습니다.",
      "CONFLICT",
    );
  }

  const count = await prisma.blog.count({ where: { userId: input.userId } });
  return prisma.blog.create({
    data: {
      name: input.name,
      url: input.url,
      rss: input.rss,
      main: count === 0,
      userId: input.userId,
      keywordTagMaps: {
        createMany: {
          data: input.keywords,
        },
      },
    },
    include: { keywordTagMaps: true },
  });
}

export async function update(
  id: number,
  input: {
    name?: string;
    userId: number;
    keywords?: {
      keyword: string;
      tags: string[];
    }[];
  },
) {
  if (input.name) {
    const blog = await prisma.blog.findFirst({
      where: { userId: input.userId, name: input.name },
    });
    if (blog) {
      throw new HttpError(
        "블로그 이름은 중복으로 생성할 수 없습니다.",
        "CONFLICT",
      );
    }
  }
  const blog = await prisma.blog.findFirst({ where: { id } });
  if (!blog) {
    throw new HttpError("블로그를 찾을 수 없습니다.", "NOT_FOUND");
  }

  return prisma.blog.update({
    where: { id },
    data: {
      name: input.name,
      ...(input.keywords?.length && {
        keywordTagMaps: {
          deleteMany: {},
          createMany: { data: input.keywords },
        },
      }),
    },
    include: { keywordTagMaps: true },
  });
}

export async function remove(input: { blogId: number; userId: number }) {
  const blog = await findOneById(input);
  if (blog?.main) {
    throw new HttpError("기본 블로그는 삭제할 수 없습니다.", "BAD_REQUEST");
  }
  return prisma.blog.delete({ where: { id: input.blogId } });
}
