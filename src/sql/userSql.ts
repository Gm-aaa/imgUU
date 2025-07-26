import {insert, d1Query} from '@/lib/server/dbutil';


export const insertUserSql = (db: D1Database, id: string, oauthProvider: string, oauthId: string, email: string, username: string) => {
  return insert(db, `INSERT INTO users (id, oauth_provider, oauth_id, email, username, is_allowed) VALUES (?, ?, ?, ?, ?, ?)`, [id, oauthProvider, oauthId, email, username, 0]);
}


export const selectUserByOauthIdSql = (db: D1Database, oauthId: string) => {
  return db.prepare(`SELECT * FROM users WHERE oauth_id = ?`).bind(oauthId).first();
}

export const selectAllUsersSql = (db: D1Database) => {
  return d1Query(db, `SELECT * FROM users ORDER BY username`);
}

export const toggleUserAllowedSql = (db: D1Database, userId: string) => {
  return db.prepare(`UPDATE users SET is_allowed = 1 - is_allowed WHERE id = ?`).bind(userId).run();
}

export const checkUserAllowedSql = (db: D1Database, oauthId: string) => {
  return db.prepare(`SELECT is_allowed FROM users WHERE oauth_id = ?`).bind(oauthId).first();
}