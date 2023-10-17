import { createRouter } from "router";
import { signIn } from "@/services/auth";

export default createRouter({
  method: "POST",
  descriptor: {
    username: "string nullable",
    profileUrl: "string nullable",
    provider: "string nullable",
    providerId: "string nullable",
  },
  async handler(context) {
    return signIn(context.body);
  },
});
