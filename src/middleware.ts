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
  
  // 获取所有session cookie值
  const cookieHeader = context.request.headers.get('cookie');
  const allSessionTokens: string[] = [];
  
  if (cookieHeader) {
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'session' && value) {
        allSessionTokens.push(value);
      }
    }
  }
  
  console.log(`[DEBUG] Request: ${context.url.pathname}, Found ${allSessionTokens.length} session tokens`);
  console.log(`[DEBUG] All cookies:`, cookieHeader);
  console.log(`[DEBUG] Session tokens:`, allSessionTokens);
  
	if (allSessionTokens.length === 0) {
    console.log('[DEBUG] No session tokens found, setting user/session to null');
    context.locals.session = null;
    context.locals.user = null;
    return next();
  }
  
  // 尝试验证每个session token，找到第一个有效的
  let validUser = null;
  let validSession = null;
  let validToken = null;
  
  for (const token of allSessionTokens) {
    const { user, session } = await validateSessionToken(MY_DB, token);
    if (session !== null && user !== null) {
      validUser = user;
      validSession = session;
      validToken = token;
      console.log(`[DEBUG] Found valid session token: ${token}`);
      break;
    }
  }
  
  console.log(`[DEBUG] Session validation result:`, {
    sessionExists: validSession !== null,
    userExists: validUser !== null,
    userId: validUser?.id,
    username: validUser?.username,
    sessionId: validSession?.id
  });
  
	if (validSession !== null && validToken !== null) {
		// Session有效，刷新cookie
		setSessionTokenCookie(context, validToken, validSession.expiresAt);
		console.log(`[DEBUG] Valid session found, cookie refreshed`);
	} else {
		// 所有Session都无效，清除所有cookie
		console.log(`[DEBUG] No valid session tokens found, clearing all cookies`);
		deleteSessionTokenCookie(context);
	}
	context.locals.session = validSession;
	context.locals.user = validUser;
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
		console.log(`[DEBUG] No session found for protected route ${context.url.pathname}, redirecting to /login`);
		return context.redirect("/login");
	}
	console.log(`[DEBUG] Access granted to ${context.url.pathname} for user ${context.locals.user?.username}`);
	return next();	
});

export const onRequest = sequence(rateLimitMiddleware, authMiddleware, authMiddleware2);
