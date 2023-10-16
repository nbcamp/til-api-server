import { prisma } from "prisma";

export const findByProvider = async (provider: string, providerId: string) => {
  return prisma.user.findUnique({
    where: {
      provider_providerId: {
        provider,
        providerId,
      },
    },
  });
};

export const sync = async (id: number) => {
  return prisma.user.update({
    where: { id },
    data: {
      lastSignedAt: new Date(),
    },
  });
};
