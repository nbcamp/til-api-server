import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export function sign(payload: object) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verify(token: string): object | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return typeof payload === "object" ? payload : null;
  } catch (error) {
    return null;
  }
}
