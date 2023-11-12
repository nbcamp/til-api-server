export const HttpStatusCode = {
  OK: 200,
  CREATED: 201,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,

  CONFLICT: 409,

  INTERNAL_SERVER_ERROR: 500,
};

export type Status = keyof typeof HttpStatusCode;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class HttpError extends Error {
  status!: Status;

  get code() {
    return HttpStatusCode[this.status];
  }

  constructor(message: string, status: Status, cause?: unknown) {
    super(message);
    this.status = status;
    this.cause = cause;
  }
}

export function response(data: object, status: Status): Response {
  const code = HttpStatusCode[status];

  return new Response(JSON.stringify(data), {
    status: code,
    statusText: status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
