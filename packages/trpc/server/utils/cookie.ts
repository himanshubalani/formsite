import { CookieOptions, Response, Request} from 'express';
import { TPRCContext } from '../context';

const ONE_MINUTE = 60*1000 //milliseconds in a minute
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR
const ONE_MONTH = 30 * ONE_DAY
const ONE_YEAR = 12 * ONE_MONTH


const defaultCookieOptions: CookieOptions = {
	path: '/',
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production' || false,
	sameSite: 'strict',
	maxAge: 7 * ONE_DAY, 
};

export function createCookieFactory(res: Response) {
	return function createCookie(
		name: string,
		value: string,
		opts: CookieOptions = defaultCookieOptions
	) {
		res.cookie(name, value, opts);
	}
}

export function getCookieFactory(req: Request) {
	return function getCookie(name: string) {
		return req.cookies?.[name];
	};
}

export function clearCookieFactory(res: Response) {
	return function clearCookie(name: string) {
		res.clearCookie(name);
	};
}

//Auth Cookies

const AUTH_COOKIE_NAME = 'authentication-token'
export function setAuthenticationCookie(ctx: TPRCContext, accessToken: string) {
	ctx.createCookie(AUTH_COOKIE_NAME, accessToken)
}

export function getAuthenticationCookie(ctx: TPRCContext) {
	return ctx.getCookie(AUTH_COOKIE_NAME)
}

export function clearAuthenticationCookie(ctx: TPRCContext) {
	ctx.clearCookie(AUTH_COOKIE_NAME)
}