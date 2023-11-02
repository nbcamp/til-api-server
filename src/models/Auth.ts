import { User } from "./User";

export interface Auth {
  accessToken: string;
  user: User;
}
