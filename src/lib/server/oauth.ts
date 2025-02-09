import { GitHub } from "arctic";

export const github = new GitHub(
	import.meta.env.GITHUB_CLIENT_ID,
	import.meta.env.GITHUB_CLIENT_SECRET,
	import.meta.env.GITHUB_CALLBACK_URL
);