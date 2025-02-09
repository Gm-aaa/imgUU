import { github } from "@/lib/server/oauth";
import { createUser, getUserFromGitHubId } from "@/lib/server/user";

import { OAuth2RequestError } from "arctic";
import { createSession, generateSessionToken, setSessionTokenCookie } from "@/lib/server/session";

import type { OAuth2Tokens } from "arctic";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  const { MY_DB } = context.locals.runtime.env;
	const storedState = context.cookies.get("github_oauth_state")?.value ?? null;
	const code = context.url.searchParams.get("code");
	const state = context.url.searchParams.get("state");

	if (storedState === null || code === null || state === null) {
		return new Response("Please restart the process1.", {
			status: 400
		});
	}
	if (storedState !== state) {
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
			const sessionToken = generateSessionToken();
			const session = await createSession(MY_DB,sessionToken, existingUser.id);
			setSessionTokenCookie(context, sessionToken, session.expiresAt);
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
		const user = await createUser(MY_DB, githubUserId, email, username);
		const sessionToken = generateSessionToken();
		const session = await createSession(MY_DB,sessionToken, user.id);
		setSessionTokenCookie(context, sessionToken, session.expiresAt);
		return context.redirect("/");
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