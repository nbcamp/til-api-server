export interface CursorBasedPagination {
  q?: string;
  cursor?: number;
  limit?: number;
  sort?: "asc" | "desc";
}

export function normalizePaginationQuery(
  query: Record<string, string | string[]>,
): CursorBasedPagination {
  return {
    q: typeof query.q === "string" ? query.q.trim() : undefined,
    cursor: query.cursor ? +query.cursor : undefined,
    limit: query.limit ? +query.limit : undefined,
    sort: query.sort === "desc" ? "desc" : "asc",
  };
}
