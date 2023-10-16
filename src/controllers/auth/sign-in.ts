import { Guard } from "@/guards";
import { signIn } from "@/services/auth";

export default new Guard()
  .payload({
    username: "string nullable",
    profileUrl: "string nullable",
    provider: "string nullable",
    providerId: "string nullable",
  })
  .build((context) => {
    return signIn(context.body);
  });
