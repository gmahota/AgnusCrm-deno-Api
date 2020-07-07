import { MiddlewareFunc, Context } from "../deps.ts";
import { validateJwt } from "https://deno.land/x/djwt/validate.ts";
import key from "../key.ts";

export class ErrorHandler extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const authMiddleware: MiddlewareFunc = (next) =>
  async (ctx) => {
    try {
      const headers: Headers = ctx.request.headers;
      // Taking JWT from Authorization header and comparing if it is valid JWT token, if YES - we continue,
      // otherwise we return with status code 401
      const authorization = headers.get("Authorization");
      if (!authorization) {
        throw new ErrorHandler("", 401);
      }
      const jwt = authorization.split(" ")[1];
      if (!jwt) {
        throw new ErrorHandler("", 401);
      }
      if (await (await validateJwt(jwt, key)).isValid) {
        await next(ctx);
      }

      throw new ErrorHandler("Invalid jwt token", 401);
    } catch (err) {
      const error = err as ErrorHandler;
      ctx.response.status = error.status || 500;
      ctx.response.body = error.message;
    }
  };

export default authMiddleware;