import type { User, Session } from '@/types';
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import type { APIContext } from "astro";
import { sha256 } from "@oslojs/crypto/sha2";
import * as sessionSql from "@/sql/sessionSql"

export async function validateSessionToken(db : D1Database, token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const row = await sessionSql.selectUserSessionBySessionIdSql(db, sessionId);
	if (row === null) {
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
	context.cookies.set("session", token, {
		httpOnly: true,
		path: "/",
		secure: import.meta.env.PROD,
		sameSite: "lax",
		expires: expiresAt
	});
}

export function deleteSessionTokenCookie(context: APIContext): void {
	context.cookies.set("session", "", {
		httpOnly: true,
		path: "/",
		secure: import.meta.env.PROD,
		sameSite: "lax",
		maxAge: 0
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