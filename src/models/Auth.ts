import { dateToUnixTime } from "utils/datetime";

export interface Auth {
  accessToken: string;
  user: AuthUser;
}

export interface AuthUser {
  id: number;
  username: string | null;
  avatarUrl: string | null;
  isAgreed: boolean;
  lastSignedAt: Date | null;
  lastPublishedAt?: Date | null;
  posts: number;
  followers: number;
  followings: number;
  hasBlog: boolean;
}

export interface RawAuthUser {
  id: number;
  username: string | null;
  avatarUrl: string | null;
  isAgreed: boolean;
  lastSignedAt: Date | null;
  _count: {
    posts: number;
    followers: number;
    followings: number;
    blogs: number;
  };
  blogs: {
    lastPublishedAt: Date | null;
  }[];
}

export function toAuthUser(raw: RawAuthUser): AuthUser {
  return {
    id: raw.id,
    username: raw.username,
    avatarUrl: raw.avatarUrl,
    isAgreed: raw.isAgreed,
    lastSignedAt: dateToUnixTime(raw.lastSignedAt),
    lastPublishedAt: dateToUnixTime(raw.blogs[0]?.lastPublishedAt),
    posts: raw._count.posts,
    followers: raw._count.followers,
    followings: raw._count.followings,
    hasBlog: raw._count.blogs > 0,
  };
}
