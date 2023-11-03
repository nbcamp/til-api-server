import { dateToUnixTime } from "utils/datetime";

export interface Post {
  id: number;
  blogId: number;
  userId: number;
  title: string;
  content: string;
  url: string;
  tags: string[];
  publishedAt: number;
}

export interface RawPost {
  id: number;
  blogId: number;
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
    blogId: raw.blogId,
    userId: raw.userId,
    title: raw.title,
    content: raw.content,
    url: raw.url,
    tags: raw.postTags.map(({ tag }) => tag),
    publishedAt: dateToUnixTime(raw.publishedAt),
  };
}
