import glob from "fast-glob";
import path from "node:path";

import { InferType, TypeDescriptor, typeGuard } from "@/guards/typeGuard";
import { HttpError } from "@/utilities/error";
import * as jwt from "@/utilities/jwt";

export type Body = { [key: string]: any };

export type Context<TBody extends Body = Body> = {
  param: { [key: string]: string };
  query: { [key: string]: string };
  body: TBody;
  request: Request;
};

export type AuthContext<TBody extends Body> = Context<TBody> & {
  auth: {
    token: string;
    userId: number;
  };
};

export type Result = Record<string, any>;

export type Handler<TContext extends Context = Context> = (
  context: TContext,
) => Result | Promise<Result>;

export type Router<Descriptor extends TypeDescriptor> = {
  descriptor?: Descriptor;
  authorized?: boolean;
} & (
  | {
      authorized: true;
      handler: Handler<AuthContext<InferType<Descriptor>>>;
    }
  | {
      authorized?: false;
      handler: Handler<Context<InferType<Descriptor>>>;
    }
);

export function createRouter<Descriptor extends TypeDescriptor>(
  router: Router<Descriptor>,
): Handler {
  return (context) => {
    if (router.descriptor && !typeGuard(context.body, router.descriptor)) {
      throw new HttpError("요청 정보가 올바르지 않습니다.", "BAD_REQUEST");
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
      Reflect.set(context, "auth", {
        token,
        userId: payload.id,
      });
    }
    return router.handler(context as any);
  };
}

async function makeFileSystemBasedRouterMap(dir: string) {
  const controllers = path.resolve(__dirname, dir);
  const filenames = await glob("**/*.ts", { cwd: controllers });

  const routers: {
    route: string;
    handler: Handler;
  }[] = await Promise.all(
    filenames.map(async (filename) => {
      const route = `/${filename.replace(/\.ts$/, "")}`;
      const { default: handler } = await import(
        path.resolve(controllers, filename)
      );
      return { route, handler };
    }),
  );

  return routers.reduce<{ [route: string]: Handler }>(
    (acc, { route, handler }) => ({ ...acc, [route]: handler }),
    {},
  );
}

export default await makeFileSystemBasedRouterMap("controllers");
