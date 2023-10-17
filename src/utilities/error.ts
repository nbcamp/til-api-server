import { HttpStatusCode, Status } from "./response";

export class HttpError extends Error {
  status!: Status;

  get code() {
    return HttpStatusCode[this.status];
  }

  constructor(message: string, status: Status, cause?: Error) {
    super(message);
    this.status = status;
    this.cause = cause;
  }
}
