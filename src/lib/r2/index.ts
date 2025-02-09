import type { StorageR2Config } from '@/types';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export function getR2Bucket(config: StorageR2Config): R2Upload {
  return new R2Upload(config);
}


/**
 * 根据文件扩展名获取 ContentType
 * @param {string} filePath - 文件路径
 * @returns {string} ContentType
 */
function getContentType(filePath) {
  const extension = filePath.split('.').pop().toLowerCase();
  const contentTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp', 
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'json': 'application/json',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    // 可以根据需要添加更多类型
  };
  
  return contentTypes[extension] || 'application/octet-stream';
}


class R2Upload {
  private client: S3Client;
  private bucketName: string;

  constructor(config: StorageR2Config) {
    this.bucketName = config.bucketName;
    const endpoint = config.accountId.startsWith('https:') ? config.accountId : `https://${config.accountId}.r2.cloudflarestorage.com`;
    // 初始化 S3 客户端
    this.client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /**
   * 上传文件到 R2 存储
   * @param file 要上传的文件
   * @param key 文件在 R2 中的唯一标识符
   * @param contentType 文件的 MIME 类型
   */
  async uploadFile(
    file: Buffer | Blob | string,
    key: string,
    contentType?: string
  ): Promise<string> {
    try {
      // 如果传入的是字符串，则将其转换为 Buffer
      const fileBuffer = typeof file === 'string' ? Buffer.from(file) : file;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType || getContentType(key),
      });

      const response = await this.client.send(command);

      if (response.$metadata.httpStatusCode === 200) {
        return `https://${this.bucketName}.r2.cloudflarestorage.com/${key}`;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file to R2:', error);
      throw error;
    }
  }
}
