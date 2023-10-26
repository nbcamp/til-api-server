import { prisma } from "prisma";

export async function findById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export async function findByProvider(provider: string, providerId: string) {
  return prisma.user.findUnique({
    where: {
      providerIndex: {
        provider,
        providerId,
      },
    },
  });
}

export function create(input: {
  username?: string | null;
  avatarUrl?: string | null;
  provider: string;
  providerId: string;
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
  return prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      blogs: {
        deleteMany: {},
      },
    },
  });
}

export function sync(id: number) {
  return prisma.user.update({
    where: { id },
    data: {
      lastSignedAt: new Date(),
      deletedAt: null,
    },
  });
}
