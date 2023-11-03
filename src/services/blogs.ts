import { HttpError } from "utils/http";
import { prisma } from "prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

/**
 * @param userId 사용자 ID를 지정하면 해당 사용자의 블로그 목록을 조회합니다.
 * @returns 블로그 목록
 */
export function findAll(where?: { userId?: number }) {
  return prisma.blog.findMany({
    where,
    include: { keywordTagMaps: true },
  });
}

/**
 * @param userId 해당 사용자의 메인 블로그를 조회합니다.
 * @returns 메인 블로그
 */
export async function findMainByUserId(userId: number) {
  try {
    return await prisma.blog.findFirstOrThrow({
      where: { userId, main: true },
      include: { keywordTagMaps: true },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new HttpError("메인 블로그를 찾을 수 없습니다.", "NOT_FOUND");
      }
    }
    throw error;
  }
}

/**
 * @param blogId 블로그의 ID
 * @param userId 사용자 ID를 지정하면 해당 사용자의 블로그를 조회합니다.
 * @returns 블로그
 */
export function findById(blogId: number, where?: { userId?: number }) {
  return prisma.blog.findFirst({
    where: { id: blogId, ...where },
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
  input: {
    name?: string;
    main?: boolean;
    keywords?: {
      keyword: string;
      tags: string[];
    }[];
  },
  where?: {
    blogId?: number;
    userId?: number;
  },
) {
  const { blogId: id, userId } = where ?? {};
  const blog = await prisma.blog.findFirst({ where: { id, userId } });
  if (!blog) {
    throw new HttpError("블로그를 찾을 수 없습니다.", "NOT_FOUND");
  }

  if (input.name) {
    const blog = await prisma.blog.findFirst({
      where: { userId, name: input.name, NOT: { id } },
    });
    if (blog) {
      throw new HttpError(
        "블로그 이름은 중복으로 생성할 수 없습니다.",
        "CONFLICT",
      );
    }
  }

  return prisma.$transaction(async (tx) => {
    if (input.main) {
      await tx.blog.updateMany({
        where: { userId },
        data: { main: false },
      });
    }
    return tx.blog.update({
      where: { id },
      data: {
        name: input.name,
        main: input.main,
        ...(input.keywords?.length && {
          keywordTagMaps: {
            deleteMany: {},
            createMany: { data: input.keywords },
          },
        }),
      },
      include: { keywordTagMaps: true },
    });
  });
}

export async function remove(blogId: number, userId?: number) {
  const blog = await findById(blogId, { userId });
  if (blog?.main) {
    throw new HttpError("기본 블로그는 삭제할 수 없습니다.", "BAD_REQUEST");
  }
  return prisma.blog.delete({ where: { id: blogId } });
}
