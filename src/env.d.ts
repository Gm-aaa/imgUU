// Astro types, not necessary if you already have a tsconfig.json
/// <reference path="../.astro/types.d.ts" />


type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {
		user: User | null;
		session: Session | null;
	}
}

interface ImportMetaEnv {
  readonly GITHUB_CLIENT_ID: string;
  readonly GITHUB_CLIENT_SECRET: string;
	readonly GITHUB_CALLBACK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


interface Window {
  Alpine: import('alpinejs').Alpine;
}