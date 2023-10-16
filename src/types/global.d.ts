export {};

declare global {
  type Context<Body extends { [key: string]: any } = { [key: string]: any }> = {
    param: { [key: string]: string };
    query: { [key: string]: string };
    body: Body;
    request: Request;
  };

  type Handler<AppContext extends Context = Context> = (
    ctx: AppContext,
  ) => Response | Promise<Response>;
  type Router = { [route: string]: Handler };
}
