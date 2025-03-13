
export interface Session {
	id: string;
	expiresAt: Date;
	userId: string;
}

export interface User {
	id: string;
	email: string;
	oauthId: string;
	username: string;
}

export interface Storage {
	id?: number;
	userId: string;
	provider: string;
	bucketName: string;
	config: string;
}

export interface StorageR2Config {
	accountId: string;
	accessKeyId: string;
	secretAccessKey: string;
	bucketName: string;
}

export interface StorageImgUUConfig {
	bucketHost: string;
	bucketApiKey: string;
	bucketName: string;
}

export interface Website{
	id?: number;
	userId: string;
	storageId: number;
  domain: string;
	cdnDomain?: string;
	pathTemplate: string;
}


export interface Upload {
	id?: number;
	userId: string;
	websiteId: number;
	originalFilename: string;
	storedFilename: string;
	fileType: string;
	fileSize: number;
	fileUrl: string;
}