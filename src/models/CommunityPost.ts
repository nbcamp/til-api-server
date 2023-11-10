import { Post, toPost, RawPost } from "./Post";
import { RawUser, User, toUser } from "./User";

export interface CommunityPost extends Exclude<Post, "userId"> {
  user: User;
}

export interface RawCommunityPost extends RawPost {
  user: RawUser;
}

export function toCommunityPost(raw: RawCommunityPost): CommunityPost {
  return {
    ...toPost(raw),
    user: toUser(raw.user),
  };
}
