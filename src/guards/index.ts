import * as jwt from "@/utilities/jwt";
import { InferType, TypeDescriptor, typeGuard } from "./typeGuard";
import { HttpError } from "@/utilities/error";

type AuthContext<Body extends { [key: string]: any }> = Context<Body> & {
  auth: {
    token: string;
    userId: number;
  };
};

export class Guard<
  Descriptor extends TypeDescriptor,
  Body extends InferType<Descriptor>,
  AppContext extends Context<Body>,
> {
  private descriptor: Descriptor | null = null;
  private useAuth: boolean = false;

  public payload<
    TDescriptor extends TypeDescriptor,
    TBody extends InferType<TDescriptor>,
    TContext extends AppContext extends AuthContext<Body>
      ? AuthContext<TBody>
      : Context<TBody>,
  >(descriptor: TDescriptor): Guard<TDescriptor, TBody, TContext> {
    this.descriptor = descriptor as any;
    return this as any;
  }

  public authorized<TContext extends AuthContext<Body>>(): Guard<
    Descriptor,
    Body,
    TContext
  > {
    this.useAuth = true;
    return this as any;
  }

  public build(handler: Handler<AppContext>): Handler<AppContext> {
    return (context) => {
      if (this.descriptor && !typeGuard(context.body, this.descriptor)) {
        throw new HttpError("요청 정보가 올바르지 않습니다.", "BAD_REQUEST");
      }

      if (this.useAuth) {
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

      return handler(context);
    };
  }
}
