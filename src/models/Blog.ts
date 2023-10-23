import { KeywordTags } from "./KeywordTags";

export class Blog {
  id!: number;
  name!: string;
  url!: string;
  rss!: string;
  primary!: boolean;
  keywords!: KeywordTags[];
  createdAt!: number;
}
