import glob from "fast-glob";
import path from "node:path";

import { User } from "@prisma/client";
import { HttpError, HttpMethod } from "@/utils/http";
import { InferType, TypeDescriptor, validate } from "@/utils/validator";

import * as jwt from "services/jwt";
import * as users from "services/users";

interface Body {
  [key: string]: any;
}

interface Context<TBody extends Body> {
  param: { [key: string]: string };
  query: { [key: string]: string };
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

type AnyHandler = Handler<Context<any>>;

type Router<Descriptor extends TypeDescriptor> =
  | AuthRouter<Descriptor>
  | OpenRouter<Descriptor>;

interface AuthRouter<
  TDescriptor extends TypeDescriptor,
  TBody extends Body = InferType<TDescriptor>,
> {
  method?: HttpMethod;
  descriptor?: TDescriptor;
  authorized: true;
  handler: Handler<AuthContext<TBody>>;
}

interface OpenRouter<
  TDescriptor extends TypeDescriptor,
  TBody extends Body = InferType<TDescriptor>,
> {
  method?: HttpMethod;
  descriptor?: TDescriptor;
  authorized?: false;
  handler: Handler<Context<TBody>>;
}

interface AnyRouter {
  route: string;
  method: string;
  handler: AnyHandler;
}

export function createRouter<Descriptor extends TypeDescriptor = never>(
  router: Router<Descriptor>,
): Router<Descriptor> {
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
        const payload = jwt.verify(token);
        if (!payload || !("id" in payload) || typeof payload.id !== "number") {
          throw new HttpError("인증 정보가 올바르지 않습니다.", "UNAUTHORIZED");
        }
        const user = await users.findById(payload.id);
        if (!user) {
          throw new HttpError(
            "사용자 정보를 찾을 수 없습니다.",
            "UNAUTHORIZED",
          );
        }

        (context as AuthContext<any>).auth = {
          token,
          user,
        };
      }

      return router.handler(context as any);
    },
  };
}

async function makeFileSystemBasedRouterMap(dir: string): Promise<AnyRouter[]> {
  const controllers = path.resolve(__dirname, dir);
  const filenames = await glob("**/*.ts", { cwd: controllers });

  const routers: AnyRouter[][] = await Promise.all(
    filenames.map(async (filename) => {
      const route = `/${filename.replace(/(\/?index)?\.ts$/, "")}`;
      const imported: { [route: string]: AnyRouter } = await import(
        path.resolve(controllers, filename)
      );
      if (!imported) {
        throw new Error(`Router not found: ${filename}`);
      }
      return Object.values(imported).map((router) => ({
        route,
        method: router.method ?? "GET",
        handler: router.handler,
      }));
    }),
  );

  return routers.flat();
}

export default await makeFileSystemBasedRouterMap("controllers");
