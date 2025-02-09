import type { APIContext } from "astro";
import { getR2Bucket } from "@/lib/r2";
import { checkNumber, createPath } from "@/lib/utils/commonutil";
import * as websiteSql from "@/sql/websiteSql"
import * as storageSql from "@/sql/storageSql"
import * as uploadSql from "@/sql/uploadSql"
import type { StorageR2Config, Upload } from "@/types";
import { Buffer } from 'buffer';
import { md5 } from 'js-md5';

export async function POST(context: APIContext): Promise<Response> {
  try {
    const { MY_DB } = context.locals.runtime.env;
    const user = context.locals.user;
    const formData = await context.request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: "Invalid file type" }), { status: 400 });
    }
    const websiteId = formData.get("websiteId") as string;

    if (!websiteId) {
      return new Response(JSON.stringify({ error: "websiteId required" }), {
        status: 400,
      });
    }
    if (!checkNumber(websiteId)) {
      return new Response(JSON.stringify({ error: "Invalid websiteId" }), {
        status: 400,
      });
    }
    const website = await websiteSql.selectWebsiteByIdAndUserIdSql(MY_DB, Number(websiteId), user.id);
    if (!website) {
      return new Response(JSON.stringify({ error: "Invalid websiteId" }), {
        status: 400,
      });
    }
    const storage = await storageSql.selectStorageByIdSql(MY_DB, Number(websiteId));
    if (!storage) {
      return new Response(JSON.stringify({ error: "Invalid websiteId" }), {
        status: 400,
      });
    }

    let imageUrl = "";
    let storageConfig: StorageR2Config = null;
    if(storage.provider == "r2") {
      storageConfig = JSON.parse(storage.config);
      const bucket = getR2Bucket(storageConfig);
      if (!bucket) {
        return new Response(JSON.stringify({ error: "Failed to get storage" }), {
          status: 500,
        });
      }
      const fileExt = `.${file.name.split('.').pop()}`;
      const fileType = file.type;
      const fileSize = file.size;
      const arrayBuffer = await file.arrayBuffer();
      const md5Hex = md5(arrayBuffer);
      const imagePath = createPath(website.path_template, md5Hex, fileExt);
      imageUrl = `${website.domain}/${imagePath}`;
      const buffer = Buffer.from(arrayBuffer);
      await bucket.uploadFile(buffer, imagePath, fileType);
      const upload: Upload = {
        userId: user.id,
        websiteId: Number(websiteId),
        originalFilename: file.name,
        storedFilename: imagePath,
        fileType: fileType,
        fileSize: fileSize,
        fileUrl: imageUrl
      }
      await uploadSql.inserUploadSql(MY_DB, upload);
    }

    
    return new Response(
      JSON.stringify({ success: true, imageUrl: imageUrl }), 
      { status: 200, headers: {"Content-Type": "application/json"} }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}
  