import { HttpError } from "@/utilities/error";
import { prisma } from "prisma";

export async function create(input: {
  ownerId: number;
  name: string;
  url: string;
  rss: string;
}) {
  const blog = await findByName(input.name);
  if (blog) {
    throw new HttpError(
      "블로그 이름은 중복으로 생성할 수 없습니다.",
      "CONFLICT",
    );
  }
  return prisma.blog.create({
    data: input,
  });
}

export function update(
  id: number,
  input: {
    name?: string;
  },
) {
  return prisma.blog.update({ where: { id }, data: input });
}

export function findByName(name: string) {
  return prisma.blog.findFirst({ where: { name } });
}
