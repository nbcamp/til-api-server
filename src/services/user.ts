import { prisma } from "prisma";

export async function findByProvider(provider: string, providerId: string) {
  return prisma.user.findUnique({
    where: {
      provider_providerId: {
        provider,
        providerId,
      },
    },
  });
}

export async function sync(id: number) {
  return prisma.user.update({
    where: { id },
    data: {
      lastSignedAt: new Date(),
    },
  });
}
