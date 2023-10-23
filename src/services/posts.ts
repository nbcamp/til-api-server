import { HttpError } from "@/utils/http";
import { prisma } from "prisma";

export function findAllByUserId(userId: number) {
  return prisma.post.findMany({ where: { userId } });
}

export function findOneById(input: { postId: number; userId: number }) {
  return prisma.post.findFirst({
    where: { id: input.postId, userId: input.userId },
  });
}

export async function update(
  id: number,
  input: { url?: string; tags?: string[] },
) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { blog: true },
  });

  if (!post) {
    throw new HttpError("해당 TIL을 찾을 수 없습니다.", "BAD_REQUEST");
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

  return prisma.post.update({
    where: { id },
    data: {
      url: input.url,
      postTags: {
        deleteMany: {},
        create: input.tags?.map((tag) => ({ tag })),
      },
    },
  });
}
