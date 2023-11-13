import { createRouter } from "router";
import { reports } from "services";
import { HttpError } from "utils/http";

export const reportUser = createRouter({
  description: "사용자를 신고합니다.",
  method: "POST",
  authorized: true,
  descriptor: {
    reason: "string",
  },
  async handler(ctx): Promise<boolean> {
    if (ctx.auth.user.id === +ctx.param.userId) {
      throw new HttpError("본인을 신고할 수 없습니다.", "BAD_REQUEST");
    }
    await reports.report(ctx.auth.user.id, +ctx.param.userId, ctx.body.reason);
    return true;
  },
});
