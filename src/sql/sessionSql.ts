import { d1QueryFirst, execSql } from '@/lib/server/dbutil';


export const selectUserSessionBySessionIdSql = (db: D1Database, sessionId: string) => {
  return d1QueryFirst(db,
`
SELECT session.id, session.user_id, session.expires_at, users.oauth_id, users.email, users.username FROM session
INNER JOIN users ON session.user_id = users.id
WHERE session.id = ?
`,
		[sessionId]
	);
}

export const createSession = (db: D1Database, sessionId: string, userId: string, expiresAt: number) => {
  return execSql(db, "INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)", [sessionId,userId,expiresAt]);
}


export const deleteSessionBySessionIdSql = (db: D1Database, sessionId: string) => {
  return execSql(db,"DELETE FROM session WHERE id = ?", [sessionId]);
}

export const updateSessionExpiresAtSql = (db: D1Database, sessionId: string, expiresAt: number) => {
  return execSql(db,"UPDATE session SET expires_at = ? WHERE id = ?", [expiresAt, sessionId]);
}

export const invalidateSession = (db : D1Database, sessionId: string) => {
  return execSql(db, "DELETE FROM session WHERE id = ?", [sessionId]);
}

export const invalidateUserSessions= (db : D1Database, userId: string) => {
  return execSql(db,"DELETE FROM session WHERE user_id = ?", [userId]);
}