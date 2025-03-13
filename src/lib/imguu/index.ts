import type { StorageImgUUConfig } from '@/types';

export function getImgUUBucket(config: StorageImgUUConfig): ImguuUpload {
  return new ImguuUpload(config);
}


class ImguuUpload {
  private bucketHost: string;
  private bucketApiKey: string;
  private bucketName: string;

  constructor(config: StorageImgUUConfig) {
    this.bucketName = config.bucketName;
    this.bucketHost = config.bucketHost;
    this.bucketApiKey = config.bucketApiKey;
  }

  /**
   * 上传文件到 imguu 存储
   * @param file 要上传的文件
   * @param path 文件路径
   */
  async uploadFile(
    file: Buffer | Blob,
    key: string,
    fileType: string
  ): Promise<string> {
    try {
      const formData = new FormData();
      const blob = new Blob([file], { type: fileType });
      formData.append('file', blob);
      formData.append('path', `/${key}`)
      // 使用fetch发送POST请求
      const response = await fetch(`${this.bucketHost}/upload`, {
          method: 'POST',
          headers: {
            'X-API-Key': this.bucketApiKey
          },
          body: formData // 将FormData作为请求体
      });
      // 检查响应状态
      if (response.ok) {
        return `${this.bucketHost}/${key}`;
      } else {
        console.error('文件上传失败:', response.statusText);
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file to imgUU:', error);
      throw error;
    }
  }
}
