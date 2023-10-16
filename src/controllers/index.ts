type Handler = (req: Request) => Response | Promise<Response>;
type Router = { [route: string]: Handler };

export default (
  await Promise.all([import("./auth.ts"), import("./users.ts")])
).reduce<Router>((router, m) => {
  Object.entries(m.default).forEach(([route, handler]) => {
    router[route] = handler;
  });
  return router;
}, {});
