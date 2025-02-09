/**
*  CREATE TABLE uploads (                             
*    id INTEGER PRIMARY KEY AUTOINCREMENT,           
*    user_id TEXT NOT NULL,                          
*    website_id INTEGER NOT NULL,                    
*    original_filename TEXT NOT NULL,                
*    stored_filename TEXT NOT NULL,                  
*    file_type TEXT NOT NULL,                        
*    file_size INTEGER NOT NULL,                     
*    file_url TEXT NOT NULL,                         
*    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
*  )   
**/
import { execSql, queryPage } from '@/lib/server/dbutil';
import type { Upload } from '@/types';


export const queryPageSql = (db: D1Database, page: number, limit: number, userId:string) => {
  return queryPage<Upload>(db, "uploads", page, limit, {"user_id": userId}, 'uploaded_at desc')
}

export const inserUploadSql = (db: D1Database, upload: Upload) => {
  return execSql(db, `INSERT INTO  uploads (user_id, website_id, original_filename, stored_filename, file_type, file_size, file_url) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    [upload.userId, upload.websiteId, upload.originalFilename, upload.storedFilename, upload.fileType, upload.fileSize, upload.fileUrl]
  );
}