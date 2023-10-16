import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export function sign(payload: object) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verify(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
