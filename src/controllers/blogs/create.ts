import { createRouter } from "router";

export default createRouter({
  method: "POST",
  authorized: true,
  handler(context) {
    return {
      id: 1,
      username: "username",
      profileUrl: "profileUrl",
    };
  },
});
