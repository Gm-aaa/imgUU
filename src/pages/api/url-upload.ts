import type { APIContext } from "astro";
import { getR2Bucket } from "@/lib/r2";
import { getImgUUBucket } from "@/lib/imguu"
import { checkNumber, createPath } from "@/lib/utils/commonutil";
import * as websiteSql from "@/sql/websiteSql"
import * as storageSql from "@/sql/storageSql"
import * as uploadSql from "@/sql/uploadSql"
import type { StorageR2Config, StorageImgUUConfig, Upload } from "@/types";
import { Buffer } from 'buffer';
import { md5 } from 'js-md5';

export async function POST(context: APIContext): Promise<Response> {
  try {
    const { MY_DB } = context.locals.runtime.env;
    const user = context.locals.user;
    const body = await context.request.json();
    const imageUrl = (body as { url: string }).url;
    const websiteId = (body as { websiteId: number }).websiteId;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Image URL required" }), { status: 400 });
    }
    if (!websiteId) {
      return new Response(JSON.stringify({ error: "websiteId required" }), { status: 400 });
    }
    if (!checkNumber(String(websiteId))) {
      return new Response(JSON.stringify({ error: "Invalid websiteId" }), { status: 400 });
    }

    // 下载图片
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch image from URL" }), { status: 400 });
    }

    const contentType = response.headers.get('content-type');
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!contentType || !allowedTypes.includes(contentType)) {
      return new Response(JSON.stringify({ error: "Invalid file type" }), { status: 400 });
    }

    const website = await websiteSql.selectWebsiteByIdAndUserIdSql(MY_DB, Number(websiteId), user.id);
    if (!website) {
      return new Response(JSON.stringify({ error: "Invalid websiteId" }), { status: 400 });
    }
    const storage = await storageSql.selectStorageByIdSql(MY_DB, Number(websiteId));
    if (!storage) {
      return new Response(JSON.stringify({ error: "Invalid websiteId" }), { status: 400 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const md5Hex = md5(arrayBuffer);
    const fileExt = `.${contentType.split('/')[1]}`;
    const date = new Date();
    
    const imagePath = createPath(date, website.path_template, md5Hex, fileExt);
    let uploadedImageUrl = "";
    if (website.cdn_domain){
      uploadedImageUrl = createPath(date, website.cdn_domain, md5Hex, fileExt);
    }else{
      uploadedImageUrl = `${website.domain}/${imagePath}`;
    }

    if(storage.provider == "r2") {
      const storageConfig: StorageR2Config = JSON.parse(storage.config);
      const bucket = getR2Bucket(storageConfig);
      if (!bucket) {
        return new Response(JSON.stringify({ error: "Failed to get storage" }), { status: 500 });
      }
      await bucket.uploadFile(buffer, imagePath, contentType);
    } else if (storage.provider == "imguu") {
      const storageConfig: StorageImgUUConfig = JSON.parse(storage.config);
      const bucket = getImgUUBucket(storageConfig);
      await bucket.uploadFile(buffer, imagePath, contentType);
    }

    const upload: Upload = {
      userId: user.id,
      websiteId: Number(websiteId),
      originalFilename: imageUrl.split('/').pop() || 'url-upload',
      storedFilename: imagePath,
      fileType: contentType,
      fileSize: buffer.length,
      fileUrl: uploadedImageUrl
    }
    await uploadSql.inserUploadSql(MY_DB, upload);

    return new Response(
      JSON.stringify({ success: true, imageUrl: uploadedImageUrl }), 
      { status: 200, headers: {"Content-Type": "application/json"} }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
  }
}