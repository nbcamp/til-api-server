import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "prisma";
import { HttpError } from "utils/http";

export async function report(
  fromUserId: number,
  toUserId: number,
  reason: string,
) {
  try {
    await prisma.userReport.create({
      data: {
        reporterId: fromUserId,
        reportedId: toUserId,
        reason,
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new HttpError("이미 신고한 사용자입니다.", "CONFLICT");
      }
      if (error.code === "P2025") {
        throw new HttpError("신고할 수 없는 사용자입니다.", "BAD_REQUEST");
      }
    }
    throw error;
  }
}
