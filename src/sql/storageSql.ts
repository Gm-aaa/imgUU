import {execSql, d1QueryFirst, d1Query } from '@/lib/server/dbutil';

export const selectStorageByUserIdSql = (db: D1Database, userId: string) => {
  return d1QueryFirst(db,`SELECT * FROM storage_configs WHERE user_id = ?`, [userId]);
}

export const selectStorageByIdSql = (db: D1Database, id: number) => {
  return d1QueryFirst(db,`SELECT * FROM storage_configs WHERE id = ?`, [id]);
}

export const selectAllStorageByUserIdSql = (db: D1Database, userId: string) => {
  return d1Query(db,`SELECT * FROM storage_configs WHERE user_id = ?`, [userId]);
}


export const insertStorageSql = (db: D1Database, userId: string, provider: string, bucketName: string, config: string) => {
  return execSql(db, `INSERT INTO storage_configs (user_id, provider, bucket_name, config) VALUES (?, ?, ?, ?)`, [userId, provider, bucketName, config]);
}

export const updateStorageSql = (db: D1Database,id: number, userId: string, provider: string, bucketName: string, config: string) => {
  return execSql(db, `UPDATE storage_configs SET provider = ?, bucket_name = ?, config = ? WHERE id = ? and user_id = ?`, [provider, bucketName, config, id, userId]);
}
