import { dateToString } from "utils/datetime";

export class Post {
  id!: number;
  title!: string;
  content!: string;
  url!: string;
  tags!: string[];
  publishedAt!: string;
}

export interface RawPost {
  id: number;
  title: string;
  content: string;
  url: string;
  postTags: { tag: string }[];
  publishedAt: Date;
}

export function toPost(raw: RawPost): Post {
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    url: raw.url,
    tags: raw.postTags.map(({ tag }) => tag),
    publishedAt: dateToString(raw.publishedAt),
  };
}
