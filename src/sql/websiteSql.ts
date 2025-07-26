import {execSql, d1QueryFirst, d1Query } from '@/lib/server/dbutil';
import type { Website } from '@/types';

export const selectWebsiteByUserIdSql = (db: D1Database, userId: string) => {
  return d1Query(db,`SELECT * FROM websites WHERE user_id = ?`, [userId]);
}

export const selectWebsiteByIdAndUserIdSql = (db: D1Database, websiteId: number, userId: string) => {
  return d1QueryFirst(db,`SELECT * FROM websites WHERE id=? and user_id = ?`, [websiteId, userId]);
}



export const insertWebsiteSql = (db: D1Database, website: Website) => {
  return execSql(db, `INSERT INTO  websites (user_id, storage_id, domain, cdn_domain, path_template) VALUES (?, ?, ?, ?, ?)`, 
    [website.userId, website.storageId, website.domain, website.cdnDomain, website.pathTemplate]
  );
}

export const updateWebsiteSql = (db: D1Database, website: Website) => {
  return execSql(db, `UPDATE websites SET storage_id = ?, domain = ?, cdn_domain = ?, path_template = ?  WHERE id = ? and user_id = ?`, 
    [website.storageId, website.domain, website.cdnDomain, website.pathTemplate, website.id, website.userId]
  );
}
