import { prisma } from "prisma";

export async function findById(id: number) {
  return prisma.user.findUnique({
    where: { id, deletedAt: null },
  });
}

export async function findByProvider(provider: string, providerId: string) {
  return prisma.user.findUnique({
    where: {
      provider_providerId: {
        provider,
        providerId,
      },
      deletedAt: null,
    },
  });
}

export function create(input: {
  username: string | null;
  avatarUrl: string | null;
  provider: string | null;
  providerId: string | null;
}) {
  return prisma.user.create({
    data: { ...input },
  });
}

export function update(
  id: number,
  input: {
    name?: string | null;
    avatarUrl?: string | null;
  },
) {
  return prisma.user.update({ where: { id }, data: input });
}

export async function remove(id: number) {
  await prisma.$transaction(async (tx) => {
    await tx.blog.deleteMany({ where: { ownerId: id } });
    return tx.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  });
}

export function sync(id: number) {
  return prisma.user.update({
    where: { id },
    data: {
      lastSignedAt: new Date(),
    },
  });
}
