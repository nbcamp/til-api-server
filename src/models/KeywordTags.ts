import { Prisma } from "@prisma/client";

export interface KeywordTags {
  keyword: string;
  tags: string[];
}

export interface RawKeywordTags {
  id: number;
  blogId: number;
  keyword: string;
  tags: Prisma.JsonValue;
}

export function toKeywordTags(raw: RawKeywordTags): KeywordTags {
  return {
    keyword: raw.keyword,
    tags: raw.tags as string[],
  };
}
