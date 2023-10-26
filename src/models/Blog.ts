import { dateToString } from "utils/datetime";
import { KeywordTags, RawKeywordTags, toKeywordTags } from "./KeywordTags";

export class Blog {
  id!: number;
  name!: string;
  url!: string;
  rss!: string;
  main!: boolean;
  keywords!: KeywordTags[];
  createdAt!: string;
}

export interface RawBlog {
  id: number;
  name: string;
  url: string;
  rss: string;
  main: boolean;
  keywordTagMaps: RawKeywordTags[];
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
    createdAt: dateToString(blog.createdAt),
  };
}
