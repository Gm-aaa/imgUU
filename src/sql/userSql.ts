import {insert} from '@/lib/server/dbutil';


export const insertUserSql = (db: D1Database, id: string, oauthProvider: string, oauthId: string, email: string, username: string) => {
  return insert(db, `INSERT INTO users (id, oauth_provider, oauth_id, email, username) VALUES (?, ?, ?, ?, ?)`, [id, oauthProvider, oauthId, email, username]);
}


export const selectUserByOauthIdSql = (db: D1Database, oauthId: string) => {
  return db.prepare(`SELECT * FROM users WHERE oauth_id = ?`).bind(oauthId).first();
}