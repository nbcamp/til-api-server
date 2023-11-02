export interface User {
  id: number;
  username: string | null;
  avatarUrl: string | null;
  posts: number;
  followers: number;
  followings: number;
}

export interface RawUser {
  id: number;
  username: string | null;
  avatarUrl: string | null;
  posts: number;
  followers: number;
  followings: number;
}

export function toUser(raw: RawUser): User {
  return {
    id: raw.id,
    username: raw.username,
    avatarUrl: raw.avatarUrl,
    posts: raw.posts,
    followers: raw.followers,
    followings: raw.followings,
  };
}
