import glob from "fast-glob";
import path from "node:path";

type Router = { [route: string]: Handler };

const controllers = path.resolve(__dirname, "controllers");
const filenames = await glob("**/*.ts", { cwd: controllers });

const router: [route: string, router: Handler][] = await Promise.all(
  filenames.map(async (filename) => {
    const route = `/${filename.replace(/\.ts$/, "")}`;
    const { default: handler } = await import(
      path.resolve(controllers, filename)
    );
    return [route, handler];
  }),
);

export default router.reduce<Router>((acc, [route, router]) => {
  return { ...acc, [route]: router };
}, {});
