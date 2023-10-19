import { HttpError } from "@/utilities/error";
import { prisma } from "prisma";

export function findAllByUserId(userId: number) {
  return prisma.blog.findMany({
    where: { userId },
    include: {
      KeywordTagMaps: {
        select: {
          keyword: true,
          tags: true,
        },
      },
    },
  });
}

export function findPrimaryByUserId(userId: number) {
  return prisma.blog.findFirst({ where: { userId, primary: true } });
}

export function findOneById(id: number) {
  return prisma.blog.findFirst({
    where: { id },
    include: {
      KeywordTagMaps: {
        select: {
          keyword: true,
          tags: true,
        },
      },
    },
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

  return prisma.$transaction(async (tx) => {
    const count = await tx.blog.count({ where: { userId: input.userId } });
    const blog = await tx.blog.create({
      data: {
        name: input.name,
        url: input.url,
        rss: input.rss,
        primary: count === 0,
        userId: input.userId,
      },
    });

    await Promise.all(
      input.keywords.map(({ keyword, tags }) =>
        tx.keywordTagMap.create({
          data: {
            keyword,
            blogId: blog.id,
            tags: JSON.stringify(tags),
          },
        }),
      ),
    );

    return blog;
  });
}

export async function update(
  id: number,
  input: {
    name?: string;
    primary?: boolean;
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
  return prisma.$transaction(async (tx) => {
    if (input.primary) {
      const blog = await findPrimaryByUserId(input.userId);
      if (blog) {
        await tx.blog.update({
          where: { id: blog.id },
          data: { primary: false },
        });
      }
    }

    if (input.keywords && input.keywords.length > 0) {
      await tx.keywordTagMap.deleteMany({ where: { blogId: id } });
      await Promise.all(
        input.keywords.map(({ keyword, tags }) =>
          tx.keywordTagMap.create({
            data: {
              keyword,
              blogId: id,
              tags: JSON.stringify(tags),
            },
          }),
        ),
      );
    }

    return tx.blog.update({ where: { id }, data: input });
  });
}

export async function remove(id: number) {
  const blog = await findOneById(id);
  if (blog?.primary) {
    throw new HttpError("기본 블로그는 삭제할 수 없습니다.", "BAD_REQUEST");
  }
  return prisma.blog.delete({ where: { id } });
}
