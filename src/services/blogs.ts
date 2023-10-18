import { HttpError } from "@/utilities/error";
import { prisma } from "prisma";

export function findAllByUserId(userId: number) {
  return prisma.blog.findMany({ where: { userId } });
}

export function findPrimaryByUserId(userId: number) {
  return prisma.blog.findFirst({ where: { userId, primary: true } });
}

export function findOneById(id: number) {
  return prisma.blog.findFirst({ where: { id } });
}

export function countOfBlogsByUserId(userId: number) {
  return prisma.blog.count({ where: { userId } });
}

export async function create(input: {
  userId: number;
  name: string;
  url: string;
  rss: string;
}) {
  throwIfDuplicateName(input.userId, input.name);
  const count = await countOfBlogsByUserId(input.userId);
  return prisma.blog.create({
    data: {
      ...input,
      primary: count === 0,
    },
  });
}

export async function update(
  id: number,
  input: {
    name?: string;
    primary?: boolean;
    userId: number;
  },
) {
  if (input.name) {
    throwIfDuplicateName(input.userId, input.name);
  }
  if (input.primary) {
    const blog = await findPrimaryByUserId(input.userId);
    if (blog) {
      await prisma.blog.update({
        where: { id: blog.id },
        data: { primary: false },
      });
    }
  }
  return prisma.blog.update({ where: { id }, data: input });
}

export async function remove(id: number) {
  const blog = await findOneById(id);
  if (blog?.primary) {
    throw new HttpError("기본 블로그는 삭제할 수 없습니다.", "BAD_REQUEST");
  }
  return prisma.blog.delete({ where: { id } });
}

async function throwIfDuplicateName(userId: number, name: string) {
  const blog = await prisma.blog.findFirst({ where: { userId, name } });
  if (blog) {
    throw new HttpError(
      "블로그 이름은 중복으로 생성할 수 없습니다.",
      "CONFLICT",
    );
  }
}
