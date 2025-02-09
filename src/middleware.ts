import { defineMiddleware, sequence } from "astro:middleware";
import { TokenBucket } from "@/lib/server/rate_limit";
import { deleteSessionTokenCookie, setSessionTokenCookie, validateSessionToken } from "@/lib/server/session";

const bucket = new TokenBucket(100, 1);

const rateLimitMiddleware = defineMiddleware((context, next) => {
	// TODO: Assumes X-Forwarded-For is always included.
	const clientIP = context.request.headers.get("X-Forwarded-For");
	if (clientIP === null) {
		return next();
	}
	let cost: number;
	if (context.request.method === "GET" || context.request.method === "OPTIONS") {
		cost = 1;
	} else {
		cost = 3;
	}
	if (!bucket.consume(clientIP, cost)) {
		return new Response("Too many requests", {
			status: 429
		});
	}
	return next();
});



const authMiddleware = defineMiddleware(async (context, next) => {
  const { MY_DB } = context.locals.runtime.env;
  const token = context.cookies.get("session")?.value ?? null;
	if (token === null) {
    context.locals.session = null;
    context.locals.user = null;
    return next();
  }
  const { user, session } = await validateSessionToken(MY_DB, token);
	if (session !== null) {
		setSessionTokenCookie(context, token, session.expiresAt);
	} else {
		deleteSessionTokenCookie(context);
	}
	context.locals.session = session;
	context.locals.user = user;
	return next();
});

const isIndexRoute = (path: string): boolean => {
	return path==="/";
};


// 定义不需要登录即可访问的路由
const openRoutes = [
  '/login', 
  '/login/github',
  '/login/github/callback'
];

const authMiddleware2 = defineMiddleware(async (context, next) => {
	// 如果是开放路由则直接放行
  if (openRoutes.includes(context.url.pathname)) {
    return next();
	}
	if (isIndexRoute(context.url.pathname)) {
		return next();
	}
	// 如果是未登录状态则重定向到登录页面
	if (context.locals.session === null) {
		return context.redirect("/login");
	}
	return next();	
});

export const onRequest = sequence(rateLimitMiddleware, authMiddleware, authMiddleware2);
