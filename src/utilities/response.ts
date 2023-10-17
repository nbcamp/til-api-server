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
