import { StatusCodes } from "http-status-codes";

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
