import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { clearCookieFactory, createCookieFactory, getCookieFactory } from "./utils/cookie";

export interface TRPCCtxUser {
  id: string;
}

export interface TPRCContext {
  createCookie: ReturnType<typeof createCookieFactory>;
  getCookie: ReturnType<typeof getCookieFactory>;
  clearCookie: ReturnType<typeof clearCookieFactory>;

  user?: TRPCCtxUser; // Optional user info, will be populated if the user is authenticated
}

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<TPRCContext> {
  const ctx: TPRCContext = {
    createCookie: createCookieFactory(res),
    getCookie: getCookieFactory(req),
    clearCookie: clearCookieFactory(res),
    user: undefined, // Will be set in authenticatedProcedure middleware if user is authenticated
  };
  return ctx;
}
export type Context = Awaited<ReturnType<typeof createContext>>;
