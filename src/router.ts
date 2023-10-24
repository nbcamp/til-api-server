import glob from "fast-glob";
import { pathToRegexp, Key } from "path-to-regexp";
import path from "node:path";

import { User } from "@prisma/client";
import { tryCatch } from "utils/tryCatch";
import { HttpError, HttpMethod, response } from "utils/http";
import { InferType, TypeDescriptor, validate } from "utils/validator";

import * as jwt from "services/jwt";
import * as users from "services/users";

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
    token: string;
    user: User;
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
  method?: HttpMethod;
  descriptor?: TDescriptor;
  priority?: number;
  route?: string | RegExp;
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

      if (router.authorized) {
        const authorization = context.request.headers.get("Authorization");
        const [tokenType, token] = authorization?.split(" ") ?? [];
        if (tokenType !== "Bearer" || !token) {
          throw new HttpError("로그인이 필요합니다.", "UNAUTHORIZED");
        }
        try {
          const payload = jwt.verify<{ id: number }>(token);
          const user = await users.findById(payload.id);
          if (!user) {
            throw new HttpError(
              "사용자 정보를 찾을 수 없습니다.",
              "UNAUTHORIZED",
            );
          }
          (context as AuthContext<any>).auth = { token, user };
        } catch (error) {
          throw new HttpError(
            "인증 정보가 올바르지 않습니다.",
            "UNAUTHORIZED",
            error as Error,
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

      const routers = Object.values(imported).reduce(
        (acc, obj) => acc.concat(obj),
        [] as AnyRouter[],
      );

      return routers.map((router) => {
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
          handler: router.handler as AnyHandler,
        } satisfies NormalizedRouter;
      });
    }),
  ).then((routers) => routers.flat().sort((a, b) => a.priority - b.priority));

  return routers;
}

const routers = await makeFileSystemBasedRouterMap("controllers");

export default async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  for (const router of routers) {
    if (router.method !== request.method) continue;

    const matches = router.route.exec(url.pathname);
    if (!matches) continue;

    const param = Object.fromEntries(
      router.keys.map((key, index) => [key, matches[index + 1]]),
    );

    try {
      const body = await tryCatch(() => request.json());
      const result = await router.handler({
        param,
        query: Object.fromEntries(url.searchParams.entries()),
        body: body || {},
        request,
      });
      return response(result, "OK");
    } catch (error) {
      console.error(error);
      if (error instanceof HttpError) {
        return response({ error: error.message }, error.status);
      }
      return response(
        { error: "Internal Server Error" },
        "INTERNAL_SERVER_ERROR",
      );
    }
  }

  return response({ error: "Not Found" }, "NOT_FOUND");
};
