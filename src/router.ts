import glob from "fast-glob";
import { pathToRegexp, Key } from "path-to-regexp";
import path from "node:path";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import logger from "utils/logger";
import { tryCatch } from "utils/tryCatch";
import { HttpError, HttpMethod, response } from "utils/http";
import { InferType, TypeDescriptor, validate } from "utils/validator";

import { jwt, users } from "services";

interface Body {
  [key: string]: any;
}

interface Param {
  [key: string]: string;
}

interface Query {
  [key: string]: string;
}

interface Context<TBody extends Body> {
  param: Param;
  query: Query;
  body: TBody;
  request: Request;
}

interface AuthContext<TBody extends Body> extends Context<TBody> {
  auth: {
    user: { id: number };
  };
}

interface Result {
  [key: string]: any;
}

interface Handler<TContext extends Context<Body>> {
  (context: TContext): Result | Promise<Result>;
}

type AnyHandler = Handler<Context<Body>>;

type Router<Descriptor extends TypeDescriptor> =
  | AuthRouter<Descriptor>
  | OpenRouter<Descriptor>;

type AnyRouter = Router<any>;

interface MetaRouter<TDescriptor extends TypeDescriptor> {
  description: string;
  method?: HttpMethod;
  descriptor?: TDescriptor;
  priority?: number;
  route?: string;
}

interface AuthRouter<
  TDescriptor extends TypeDescriptor,
  TBody extends Body = InferType<TDescriptor>,
> extends MetaRouter<TDescriptor> {
  authorized: true;
  handler: Handler<AuthContext<TBody>>;
}

interface OpenRouter<
  TDescriptor extends TypeDescriptor,
  TBody extends Body = InferType<TDescriptor>,
> extends MetaRouter<TDescriptor> {
  authorized?: false;
  handler: Handler<Context<TBody>>;
}

export function createRouter<Descriptor extends TypeDescriptor = never>(
  router: Router<Descriptor>,
): AnyRouter {
  return {
    ...router,
    method: router.method ?? "GET",
    async handler(context) {
      if (router.authorized) {
        const authorization = context.request.headers.get("Authorization");
        const [tokenType, token] = authorization?.split(" ") ?? [];
        if (tokenType !== "Bearer" || !token) {
          throw new HttpError("로그인이 필요합니다.", "UNAUTHORIZED");
        }
        try {
          const payload = jwt.verify<{ id: number }>(token);
          const user = await users.checkAuthorized(payload.id);
          (context as AuthContext<any>).auth = {
            user,
          };
        } catch (error) {
          throw new HttpError(
            "인증 정보가 올바르지 않습니다.",
            "BAD_REQUEST",
            error,
          );
        }
      }

      if (router.descriptor) {
        const result = validate(context.body, router.descriptor);
        if (!result.valid) {
          const error = result.errors[0];
          throw new HttpError(
            `요청 정보가 올바르지 않습니다. (reason: ${error.reason}, from: ${error.property})`,
            "BAD_REQUEST",
          );
        }
      }

      Object.freeze(context.body);
      Object.freeze(context.param);
      Object.freeze(context.query);
      return router.handler(context as any);
    },
  };
}

interface NormalizedRouter {
  method: HttpMethod;
  path: string;
  route: RegExp;
  keys: string[];
  priority: number;
  operationId: string;
  description: string;
  handler: AnyHandler;
}

async function makeFileSystemBasedRouterMap(
  dir: string,
): Promise<NormalizedRouter[]> {
  const controllers = path.resolve(__dirname, dir);
  const filenames = await glob("**/*.ts", { cwd: controllers });

  const routers: NormalizedRouter[] = await Promise.all(
    filenames.map(async (filename) => {
      const routePath = `/${filename.replace(/(\/?index)?\.ts$/, "")}`;
      const imported: { [route: string]: AnyRouter } = await import(
        path.resolve(controllers, filename)
      );

      const routers: [string, AnyRouter][] = Object.entries(imported).reduce(
        (acc, [key, value]) =>
          key === "default" ? acc : [...acc, [key, value]],
        [] as [string, AnyRouter][],
      );

      return routers.map(([operationId, router]) => {
        const keys: Key[] = [];
        return {
          ...router,
          path: routePath,
          method: router.method ?? "GET",
          route: pathToRegexp(router.route || routePath, keys, {
            strict: true,
          }),
          keys: keys.map((key) => `${key.name}`),
          priority: router.priority ?? 1000,
          description: router.description ?? "",
          operationId,
          handler: router.handler as AnyHandler,
        } satisfies NormalizedRouter;
      });
    }),
  ).then((routers) =>
    routers.flat().toSorted((a, b) => a.priority - b.priority),
  );

  for (const router of routers) {
    const method = router.method.toUpperCase().padEnd(6);
    const path = router.path.padEnd(50);
    const operationId = router.operationId.padEnd(20);
    const description = router.description;
    const message = `${operationId} | ${path} | ${description}`;
    logger.info(message, { label: method });
  }

  return routers;
}

const routers = await makeFileSystemBasedRouterMap("controllers");

let id = 0;

export default async (req: Request): Promise<Response> => {
  const requestId = ++id;
  const url = new URL(req.url);
  for (const router of routers) {
    if (router.method !== req.method) continue;

    const matches = router.route.exec(url.pathname);
    if (!matches) continue;

    const param = Object.fromEntries(
      router.keys.map((key, index) => [key, matches[index + 1]]),
    );

    try {
      logger.info("REQ", { request: req, id: requestId });
      const body = await tryCatch(() => parseRequestBody(req));
      const result = await router.handler({
        param,
        query: Object.fromEntries(url.searchParams.entries()),
        body: body || {},
        request: req,
      });
      const res = response(result, "OK");
      logger.info("RES", { response: res, id: requestId });
      return res;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        logger.error(`${error.message} (${error.code})`, {
          error: error.cause ?? error,
        });
        return response(
          { error: "예상치 못한 오류가 발생했습니다." },
          "BAD_REQUEST",
        );
      }

      if (error instanceof HttpError) {
        logger.error(`${error.message} (${error.code}, ${error.status})`, {
          error: error.cause ?? error,
        });
        return response({ error: error.message }, error.status);
      }

      logger.error("Internal Server Error", { error });
      return response(
        { error: "Internal Server Error" },
        "INTERNAL_SERVER_ERROR",
      );
    }
  }

  return response({ error: "Not Found" }, "NOT_FOUND");
};

function parseRequestBody(req: Request) {
  const contentType = req.headers.get("Content-Type");
  if (!contentType) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return req.json();
  }

  return null;
}
