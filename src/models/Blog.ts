import { dateToUnixTime } from "utils/datetime";
import { KeywordTags, RawKeywordTags, toKeywordTags } from "./KeywordTags";

export interface Blog {
  id: number;
  name: string;
  url: string;
  rss: string;
  main: boolean;
  keywords: KeywordTags[];
  lastPublishedAt: number | null;
  createdAt: number;
}

export interface RawBlog {
  id: number;
  name: string;
  url: string;
  rss: string;
  main: boolean;
  keywordTagMaps: RawKeywordTags[];
  lastPublishedAt: Date | null;
  createdAt: Date;
}

export function toBlog(blog: RawBlog): Blog {
  return {
    id: blog.id,
    name: blog.name,
    url: blog.url,
    rss: blog.rss,
    main: blog.main,
    keywords: blog.keywordTagMaps.map(toKeywordTags),
    lastPublishedAt: dateToUnixTime(blog.lastPublishedAt),
    createdAt: dateToUnixTime(blog.createdAt),
  };
}
