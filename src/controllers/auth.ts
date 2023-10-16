import { signIn } from "@/services/auth";
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
      return new Response(
        JSON.stringify({ error: "올바르지 않은 요청입니다." }),
        { status: 400 },
      );
    }
    const result = await signIn(payload);
    return new Response(JSON.stringify(result), { status: 200 });
  },
};
