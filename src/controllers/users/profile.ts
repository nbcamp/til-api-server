import { Guard } from "@/guards";
import * as users from "@/services/users";
import { HttpError } from "@/utilities/error";

export default new Guard().authorized().build(async (context) => {
  const user = await users.findById(context.auth.userId);
  if (!user) {
    throw new HttpError("사용자를 찾을 수 없습니다.", "NOT_FOUND");
  }
  return {
    id: user.id,
    username: user.username,
    profileUrl: user.profileUrl,
  };
});
