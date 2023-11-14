import jwt from "jsonwebtoken";
import { Config } from "sst/node/config";

export const generateJwt = async (userId: string) => {
  const secret = Config.JWT_SECRET;
  if (!secret) throw new Error("No JWT_SECRET");
  return jwt.sign({ userId }, secret);
};

export const verifyJwt = async (token: string): Promise<string> => {
  const secret = Config.JWT_SECRET;
  if (!secret) throw new Error("No JWT_SECRET");
  const p = jwt.verify(token, secret);
  if (!p) throw new Error("Invalid JWT");
  if (typeof p === "string") throw new Error(p);

  return p.userId as string;
};
