import { dateToUnixTime } from "utils/datetime";

export interface User {
  id: number;
  username: string | null;
  avatarUrl: string | null;
  lastSignedAt: number | null;
  posts: number;
  followers: number;
  followings: number;
  lastPublishedAt: number | null;
}

export interface RawUser {
  id: number;
  username: string | null;
  avatarUrl: string | null;
  lastSignedAt: Date | null;
  _count: {
    posts: number;
    followers: number;
    followings: number;
  };
  blogs: {
    lastPublishedAt: Date | null;
  }[];
}

export function toUser(raw: RawUser): User {
  return {
    id: raw.id,
    username: raw.username,
    avatarUrl: raw.avatarUrl,
    lastSignedAt: dateToUnixTime(raw.lastSignedAt),
    posts: raw._count.posts,
    followers: raw._count.followers,
    followings: raw._count.followings,
    lastPublishedAt: dateToUnixTime(raw.blogs[0]?.lastPublishedAt),
  };
}
