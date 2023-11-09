import { User } from "./User";

export interface Auth {
  accessToken: string;
  user: User;
}

export interface AuthUser {
  id: number;
  username: string | null;
  avatarUrl: string | null;
  lastSignedAt: Date | null;
  posts: number;
  followers: number;
  followings: number;
}
