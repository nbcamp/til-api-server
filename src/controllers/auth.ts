import { Guard } from "@/guards";
import { signIn } from "@/services/auth";
import { response } from "@/utilities/response";

export default {
  "/auth/sign-in": Guard.create()
    .authorized()
    .payload({
      username: "string nullable",
      profileUrl: "string nullable",
      provider: "string nullable",
      providerId: "string nullable",
    })
    .build(async (context) => {
      const payload = await signIn(context.body);
      return response(payload, "OK");
    }),
};
