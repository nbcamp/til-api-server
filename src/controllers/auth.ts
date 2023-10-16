import { signIn } from "@/services/auth";
import { response } from "@/utilities/response";
import { typeGuard } from "@/utilities/typeGuard";

export default {
  async "/auth/sign-in"(request: Request) {
    const payload = await request.json();
    if (
      !typeGuard(payload, {
        username: "string nullable",
        profileUrl: "string nullable",
        provider: "string nullable",
        providerId: "string nullable",
      })
    ) {
      return response({ error: "올바르지 않은 요청입니다" }, "BAD_REQUEST");
    }
    const result = await signIn(payload);
    return response(result, "OK");
  },
};
