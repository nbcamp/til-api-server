export function tryCatch<Func extends () => any, T>(
  handler: Func,
  defaultValue?: T,
): ReturnType<Func> | T;
export async function tryCatch<Func extends () => Promise<any>, T>(
  handler: Func,
  defaultValue?: T,
): Promise<ReturnType<Func> | T>;
export async function tryCatch(
  handler: () => any,
  defaultValue = null,
): Promise<any> {
  try {
    return await handler();
  } catch {
    return defaultValue;
  }
}
