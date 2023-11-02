import winston from "winston";

const colorize = winston.format.colorize().colorize;

const logger = winston.createLogger({
  format: winston.format.combine(
    {
      transform(info) {
        return {
          ...info,
          level: `[${info.level.toUpperCase()}]`.padStart(7),
        };
      },
    },
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss:SSS ZZ",
    }),
    winston.format.ms(),
    winston.format.colorize({
      colors: {
        timestamp: "dim",
        stack: "yellow",
        method: "blue",
        label: "magenta",
        url: "yellow",
        ms: "dim",
        id: "dim",
      },
    }),
    winston.format.printf(
      ({
        id: _id,
        label,
        timestamp,
        level,
        message,
        request,
        response,
        error,
        ms,
        ...meta
      }) => {
        function build(body: string, meta: string = "") {
          const header = `${colorize("timestamp", `${timestamp}`)}`;
          const name = label ? colorize("label", `${label} `) : "";
          const footer = `${colorize("ms", `${ms}`)}`;
          return `${header} ${level} ${name}${body} ${footer} ${meta}`;
        }

        if (request instanceof Request) {
          const id = colorize("id", `[${_id}]`);
          const url = new URL(request.url);
          const method = colorize("method", request.method);
          const pathname = colorize("url", url.pathname);
          return build(`${id} ${method} ${pathname}`);
        }

        if (response instanceof Response) {
          const id = colorize("id", `[${_id}]`);
          const status = response.status;
          const statusText = response.statusText;
          return build(`${id} ${status} ${statusText}`);
        }

        if (error instanceof Error) {
          const errorMessage = (error.stack ?? error.message) || `${error}`;
          const stack = colorize("stack", errorMessage);
          return build(message, `\n${stack}`);
        }

        const metaString = JSON.stringify(meta, null, 2);
        const metaStringified = metaString === "{}" ? "" : `\n${metaString}`;
        return build(message, metaStringified);
      },
    ),
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
