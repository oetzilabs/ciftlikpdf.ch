import { verifyJwt } from "@ciftlikpdf/core/auth";
import { User } from "@ciftlikpdf/core/entities/users";
import { StatusCodes } from "http-status-codes";
import { useHeader } from "sst/node/api";

export const getUser = async () => {
  const header = useHeader("authorization");
  if (!header) throw new Error("No authorization header");
  const [type, token] = header.split(" ");
  if (type !== "Bearer") throw new Error("Invalid authorization header");
  console.log("token", token);
  const userid = await verifyJwt(token);
  if (!userid) throw new Error("Invalid JWT");
  const user = await User.findById(userid);
  if (!user) throw new Error("No session found");
  return user;
};

export const json = (input: unknown, statusCode = StatusCodes.OK) => {
  return {
    statusCode,
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
  };
};

export const error = <T extends string | Record<string, any>>(error: T, statusCode = StatusCodes.BAD_REQUEST) => {
  const payload = typeof error === "string" ? { error } : error;
  return {
    statusCode,
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
export const text = (input: string, statusCode = StatusCodes.OK) => {
  return {
    statusCode,
    body: input,
    headers: {
      "Content-Type": "text/plain",
    },
  };
};
