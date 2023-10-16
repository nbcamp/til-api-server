import { Guard } from "@/guards";
import * as users from "@/services/user";
import { response } from "@/utilities/response";

export default {
  "/profile": Guard.create()
    .authorized()
    .build(async (context) => {
      const user = await users.findById(context.auth.userId);
      return user
        ? response(
            {
              id: user.id,
              username: user.username,
              profileUrl: user.profileUrl,
            },
            "OK",
          )
        : response(
            {
              error: "사용자를 찾을 수 없습니다.",
            },
            "NOT_FOUND",
          );
    }),
};
