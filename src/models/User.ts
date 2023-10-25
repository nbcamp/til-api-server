export class User {
  id!: number;
  username!: string | null;
  avatarUrl!: string | null;
}

export interface RawUser {
  id: number;
  username: string | null;
  avatarUrl: string | null;
}

export function toUser(raw: RawUser) {
  return {
    id: raw.id,
    username: raw.username,
    avatarUrl: raw.avatarUrl,
  };
}
