export class Post {
  id!: number;
  title!: string;
  content!: string;
  url!: string | null;
  tags!: string[];
  publishedAt!: number | null;
}
