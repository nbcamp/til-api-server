import { dateToUnixTime } from "utils/datetime";

export interface User {
  id: number;
  username: string | null;
  avatarUrl: string | null;
  lastSignedAt: number | null;
  posts: number;
  followers: number;
  followings: number;
  isMyFollowing: boolean;
  isMyFollower: boolean;
  lastPublishedAt: number | null;
  hasBlog: boolean;
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
    blogs: number;
  };
  blogs: {
    lastPublishedAt: Date | null;
  }[];
  followers: {
    followingId: number;
  }[];
  followings: {
    followerId: number;
  }[];
}

export function toUser(raw: RawUser): User {
  console.log(raw.id, raw.followers);
  return {
    id: raw.id,
    username: raw.username,
    avatarUrl: raw.avatarUrl,
    lastSignedAt: dateToUnixTime(raw.lastSignedAt),
    posts: raw._count.posts,
    followers: raw._count.followers,
    followings: raw._count.followings,
    isMyFollower: raw.followings.some(
      (follower) => follower.followerId === raw.id,
    ),
    isMyFollowing: raw.followers.some(
      (following) => following.followingId === raw.id,
    ),
    lastPublishedAt: dateToUnixTime(raw.blogs[0]?.lastPublishedAt),
    hasBlog: raw._count.blogs > 0,
  };
}
