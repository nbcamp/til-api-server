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
      },
    }),
    winston.format.printf(
      ({ label, timestamp, level, message, request, error, ms, ...meta }) => {
        function build(body: string) {
          const header = `${colorize("timestamp", `${timestamp}`)}`;
          const labelText = label ? colorize("label", `${label} `) : "";
          const footer = `${colorize("ms", `${ms}`)}`;
          return `${header} ${level} ${labelText}${body} ${footer}`;
        }

        if (request instanceof Request) {
          const url = new URL(request.url);
          const method = colorize("method", request.method);
          const pathname = colorize("url", url.pathname);
          return build(`${method} ${pathname}`);
        }

        if (error instanceof Error) {
          const errorMessage = (error.stack ?? error.message) || `${error}`;
          const stack = colorize("stack", errorMessage);
          return build(`${message}\n${stack}`);
        }

        const metaString = JSON.stringify(meta, null, 2);
        const metaStringified = metaString === "{}" ? "" : `\n${metaString}`;
        return build(`${message}${metaStringified}`);
      },
    ),
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
