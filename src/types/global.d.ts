export {};

declare global {
  type MaybePromise<T> = T | Promise<T>;

  type Context<Body extends { [key: string]: any } = { [key: string]: any }> = {
    param: { [key: string]: string };
    query: { [key: string]: string };
    body: Body;
    request: Request;
  };

  type Result = Record<string, any>;

  type Handler<AppContext extends Context = Context> = (
    ctx: AppContext,
  ) => MaybePromise<Result>;
}
