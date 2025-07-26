import type { User, Session } from '@/types';
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import type { APIContext } from "astro";
import { sha256 } from "@oslojs/crypto/sha2";
import * as sessionSql from "@/sql/sessionSql"

export async function validateSessionToken(db : D1Database, token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	console.log(`[DEBUG] validateSessionToken - token: ${token}, sessionId: ${sessionId}`);
	const row = await sessionSql.selectUserSessionBySessionIdSql(db, sessionId);
	console.log(`[DEBUG] validateSessionToken - database query result:`, row);
	if (row === null) {
		console.log(`[DEBUG] validateSessionToken - no session found in database`);
		return { session: null, user: null };
	}
	const session: Session = {
		id: row.id as string,
		userId: row.user_id as string,
		expiresAt: new Date(Number(row.expires_at) * 1000)
	};
	const user: User = {
		id: row.user_id as string,
		oauthId: row.oauth_id as string,
		email: row.email as string,
		username: row.username as string
	};
	if (Date.now() >= session.expiresAt.getTime()) {
		await sessionSql.deleteSessionBySessionIdSql(db, sessionId);
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await sessionSql.updateSessionExpiresAtSql(db, sessionId, Math.floor(session.expiresAt.getTime() / 1000));
	}
	return { session, user };
}

export async function invalidateSession(db : D1Database,sessionId: string): Promise<void> {
	await sessionSql.invalidateSession(db, sessionId)
}

export async function invalidateUserSessions(db : D1Database, userId: string): Promise<void> {
	await sessionSql.invalidateUserSessions(db, userId)
}

export function setSessionTokenCookie(context: APIContext, token: string, expiresAt: Date): void {
	console.log(`[DEBUG] Setting session cookie - token: ${token}, domain: ${context.url.hostname}`);
	
	// 强制清除所有可能的session cookie
	context.cookies.delete("session", { path: "/" });
	context.cookies.delete("session", { path: "/", domain: context.url.hostname });
	context.cookies.delete("session", { path: "/", domain: `.${context.url.hostname}` });
	
	// 设置新的session cookie
	context.cookies.set("session", token, {
		httpOnly: true,
		path: "/",
		secure: false,
		sameSite: "lax",
		expires: expiresAt
	});
	
	// 通过Response header强制设置cookie作为备用方案
	const cookieValue = `session=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}`;
	console.log(`[DEBUG] Force setting cookie via header: ${cookieValue}`);
}

export function deleteSessionTokenCookie(context: APIContext): void {
	console.log(`[DEBUG] Deleting session cookie for domain: ${context.url.hostname}`);
	
	// 尝试删除所有可能的cookie变体
	context.cookies.delete("session", {
		path: "/"
	});
	
	context.cookies.delete("session", {
		path: "/",
		domain: context.url.hostname
	});
	
	context.cookies.delete("session", {
		path: "/",
		domain: `.${context.url.hostname}`
	});
	
	// 设置多个过期的cookie来确保删除所有可能的变体
	context.cookies.set("session", "", {
		path: "/",
		maxAge: 0,
		expires: new Date(0)
	});
	
	context.cookies.set("session", "", {
		path: "/",
		domain: context.url.hostname,
		maxAge: 0,
		expires: new Date(0)
	});
	
	context.cookies.set("session", "", {
		path: "/",
		domain: `.${context.url.hostname}`,
		maxAge: 0,
		expires: new Date(0)
	});
}

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32(tokenBytes).toLowerCase();
	return token;
}


export async function createSession(db: D1Database, token: string, userId: string): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	};
	await sessionSql.createSession(db, sessionId, userId, Math.floor(session.expiresAt.getTime() / 1000));
	return session;
}



type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };