import type { APIContext } from "astro";
import * as uploadSql from '@/sql/uploadSql'
import * as storageSql from '@/sql/storageSql'
import * as websiteSql from '@/sql/websiteSql'
import { getR2Bucket } from '@/lib/r2'
import { getImgUUBucket } from '@/lib/imguu'
import type { StorageR2Config, StorageImgUUConfig, Upload } from '@/types';

export async function DELETE(context: APIContext): Promise<Response> {
  try {
    const { MY_DB } = context.locals.runtime.env;
    const user = context.locals.user;
    
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(context.request.url);
    const uploadId = url.searchParams.get('id');
    
    if (!uploadId || isNaN(Number(uploadId))) {
      return new Response(JSON.stringify({ error: "Invalid upload ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 查询上传记录
    const uploadResult = await uploadSql.selectUploadByIdAndUserIdSql(MY_DB, Number(uploadId), user.id);
    const upload = uploadResult as any;
    
    if (!upload) {
      return new Response(JSON.stringify({ error: "Upload not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 获取网站配置
    const website = await websiteSql.selectWebsiteByIdAndUserIdSql(MY_DB, upload.website_id, user.id);
    if (!website) {
      return new Response(JSON.stringify({ error: "Website not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 获取存储配置
    const storage = await storageSql.selectStorageByIdSql(MY_DB, website.storage_id);
    if (!storage) {
      return new Response(JSON.stringify({ error: "Storage not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 从存储中删除文件
    try {
      if (storage.provider === "r2") {
        const storageConfig: StorageR2Config = JSON.parse(storage.config);
        const bucket = getR2Bucket(storageConfig);
        await bucket.deleteFile(upload.stored_filename);
      } else if (storage.provider === "imguu") {
        const storageConfig: StorageImgUUConfig = JSON.parse(storage.config);
        const bucket = getImgUUBucket(storageConfig);
        await bucket.deleteFile(upload.stored_filename);
      }
    } catch (storageError) {
      console.error("Storage deletion error:", storageError);
      // 继续删除数据库记录，即使存储删除失败
    }

    // 从数据库中删除记录
    await uploadSql.deleteUploadSql(MY_DB, Number(uploadId), user.id);

    return new Response(
      JSON.stringify({ success: true, message: "Upload deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return new Response(JSON.stringify({ error: "Delete failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}