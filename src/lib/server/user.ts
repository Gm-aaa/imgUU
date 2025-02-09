
import type { User } from '@/types';
import * as userSql from "@/sql/userSql"
import { generateUserId } from '@/lib/utils/idutil';



export async function createUser(db: D1Database, githubId: string, email: string, username: string): Promise<User> {
	const userId = generateUserId()
	const row = await userSql.insertUserSql(db, userId, 'github', githubId, email, username);
	if (row === null) {
		throw new Error("Unexpected error");
	}
	const user: User = {
		id: userId,
		oauthId: githubId,
		email,
		username
	};
	return user;
}

export async function getUserFromGitHubId(db: D1Database, githubId: string): Promise<User | null> {
	const dbUser = await userSql.selectUserByOauthIdSql(db, githubId);
	if (dbUser === null) {
		return null;
	}
	const user: User = {
		id: dbUser.id as string,
		oauthId: dbUser.oauth_id as string,
		email: dbUser.email as string,
		username: dbUser.username as string
	};
	return user;
}


