import { HttpError } from "@/utilities/error";
import { prisma } from "prisma";

export function findAllByOwnerId(ownerId: number) {
  return prisma.blog.findMany({ where: { ownerId } });
}

export function findPrimaryByOwnerId(ownerId: number) {
  return prisma.blog.findFirst({ where: { ownerId, primary: true } });
}

export function findOneById(id: number) {
  return prisma.blog.findFirst({ where: { id } });
}

export function countOfBlogsByOwnerId(ownerId: number) {
  return prisma.blog.count({ where: { ownerId } });
}

export async function create(input: {
  ownerId: number;
  name: string;
  url: string;
  rss: string;
}) {
  throwIfDuplicateName(input.ownerId, input.name);
  const count = await countOfBlogsByOwnerId(input.ownerId);
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
    ownerId: number;
  },
) {
  if (input.name) {
    throwIfDuplicateName(input.ownerId, input.name);
  }
  if (input.primary) {
    const blog = await findPrimaryByOwnerId(input.ownerId);
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

async function throwIfDuplicateName(ownerId: number, name: string) {
  const blog = await prisma.blog.findFirst({ where: { ownerId, name } });
  if (blog) {
    throw new HttpError(
      "블로그 이름은 중복으로 생성할 수 없습니다.",
      "CONFLICT",
    );
  }
}
