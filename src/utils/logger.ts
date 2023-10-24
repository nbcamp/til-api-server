import winston from "winston";

const colorizer = winston.format.colorize();

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
        url: "yellow",
        ms: "dim",
      },
    }),
    winston.format.printf(
      ({ timestamp, level, message, request, error, ms, ...meta }) => {
        function build(body: string) {
          const header = `${colorizer.colorize("timestamp", `${timestamp}`)}`;
          const footer = `${colorizer.colorize("ms", `${ms}`)}`;
          return `${header} ${level} ${body} ${footer}`;
        }

        if (request instanceof Request) {
          const url = new URL(request.url);
          const method = colorizer.colorize("method", request.method);
          const pathname = colorizer.colorize("url", url.pathname);
          return build(`${method} ${pathname}`);
        }

        if (error instanceof Error) {
          const errorMessage = (error.stack ?? error.message) || `${error}`;
          const stack = colorizer.colorize("stack", errorMessage);
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
