import { dateToUnixTime } from "utils/datetime";

export interface Auth {
  accessToken: string;
  user: AuthUser;
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

export interface RawAuthUser {
  id: number;
  username: string | null;
  avatarUrl: string | null;
  lastSignedAt: Date | null;
  _count: {
    posts: number;
    followers: number;
    followings: number;
  };
}

export function toAuthUser(raw: RawAuthUser): AuthUser {
  return {
    id: raw.id,
    username: raw.username,
    avatarUrl: raw.avatarUrl,
    lastSignedAt: dateToUnixTime(raw.lastSignedAt),
    posts: raw._count.posts,
    followers: raw._count.followers,
    followings: raw._count.followings,
  };
}
