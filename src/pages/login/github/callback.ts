import { github } from "@/lib/server/oauth";
import { createUser, getUserFromGitHubId } from "@/lib/server/user";
import * as userSql from "@/sql/userSql";

import { OAuth2RequestError } from "arctic";
import { createSession, generateSessionToken, setSessionTokenCookie, deleteSessionTokenCookie } from "@/lib/server/session";

import type { OAuth2Tokens } from "arctic";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  const { MY_DB } = context.locals.runtime.env;
	const storedState = context.cookies.get("github_oauth_state")?.value ?? null;
	const code = context.url.searchParams.get("code");
	const state = context.url.searchParams.get("state");

	console.log(`[DEBUG] GitHub callback - storedState: ${storedState}, code: ${code}, state: ${state}`);
	console.log(`[DEBUG] GitHub callback - all cookies:`, context.request.headers.get('cookie'));

	if (storedState === null || code === null || state === null) {
		console.log(`[DEBUG] GitHub callback - missing parameters: storedState=${storedState}, code=${code}, state=${state}`);
		return new Response("Please restart the process1.", {
			status: 400
		});
	}
	if (storedState !== state) {
		console.log(`[DEBUG] GitHub callback - state mismatch: stored=${storedState}, received=${state}`);
		return new Response("Please restart the process2.", {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await github.validateAuthorizationCode(code);
	} catch (e) {
		return new Response("Please restart the process3.", {
			status: 400
		});
	}

	const githubAccessToken = tokens.accessToken();

	try {
		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${githubAccessToken}`,
				"User-Agent": "astro-cloudflare-pages",
			},
		});
		const githubUser: GitHubUser = await githubUserResponse.json();
		const githubUserId = githubUser.id;
		const username = githubUser.login;
		const existingUser = await getUserFromGitHubId(MY_DB, githubUserId);
		
		if (existingUser !== null) {
			// 检查用户是否被允许登录
			const userPermission = await userSql.checkUserAllowedSql(MY_DB, githubUserId);
			if (!userPermission || !userPermission.is_allowed) {
				return new Response("您的账户尚未被管理员批准，请联系管理员开通权限。", {
					status: 403
				});
			}
			
			// 先清除任何现有的session cookie
			deleteSessionTokenCookie(context);
			
			const sessionToken = generateSessionToken();
			console.log(`[DEBUG] GitHub callback - existing user login, token: ${sessionToken}, userId: ${existingUser.id}`);
			const session = await createSession(MY_DB,sessionToken, existingUser.id);
			console.log(`[DEBUG] GitHub callback - session created:`, { sessionId: session.id, userId: session.userId, expiresAt: session.expiresAt });
			
			// 设置新的session cookie
			setSessionTokenCookie(context, sessionToken, session.expiresAt);
			console.log(`[DEBUG] GitHub callback - cookie set, redirecting to /`);
			
			// 验证cookie是否正确设置
			const setCookie = context.cookies.get("session");
			console.log(`[DEBUG] GitHub callback - cookie verification:`, setCookie?.value);
			
			return context.redirect("/");
		}
		const emailListResponse = await fetch("https://api.github.com/user/emails", {
			headers: {
				Authorization: `Bearer ${githubAccessToken}`,
				"User-Agent": "astro-cloudflare-pages",
			},
		});
		const emailListResult: Array<{ email: string; primary: boolean; verified: boolean }> = await emailListResponse.json();
		if (!Array.isArray(emailListResult) || emailListResult.length < 1) {
			return new Response("Please restart the process4.", {
				status: 400
			});
		}

		let email: string | null = null;
		for (const emailRecord of emailListResult) {
			const emailParser = emailRecord;
			const primaryEmail = emailParser.primary;
			const verifiedEmail = emailParser.verified;
			if (primaryEmail && verifiedEmail) {
				email = emailParser.email;
			}
		}
		if (email === null) {
			return new Response("Please verify your GitHub email address.", {
				status: 400
			});
		}
		// 创建新用户，默认不允许登录
		const user = await createUser(MY_DB, githubUserId, email, username);
		
		// 新用户需要等待管理员审批
		return new Response("账户已创建，但需要管理员审批后才能使用。请联系管理员开通权限。", {
			status: 403
		});
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			return new Response("Please restart the process5.", {
				status: 400
			});
		}
		console.log(e)
		return new Response(String(e), {
      status: 500,
    });
	}
}


interface GitHubUser {
  id: string;
  login: string;
}