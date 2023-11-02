import { dateToUnixTime } from "utils/datetime";

export interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  url: string;
  tags: string[];
  publishedAt: number;
}

export interface RawPost {
  id: number;
  userId: number;
  title: string;
  content: string;
  url: string;
  postTags: { tag: string }[];
  publishedAt: Date;
}

export function toPost(raw: RawPost): Post {
  return {
    id: raw.id,
    userId: raw.userId,
    title: raw.title,
    content: raw.content,
    url: raw.url,
    tags: raw.postTags.map(({ tag }) => tag),
    publishedAt: dateToUnixTime(raw.publishedAt),
  };
}
