import type { APIContext } from "astro";
import { deleteSessionTokenCookie  } from "@/lib/server/session";
export async function POST(context: APIContext): Promise<Response> {
  if (!context.locals.session) {
    return new Response(null, {
      status: 401,
    });
  }

  deleteSessionTokenCookie(context);
  context.locals.session = null;
  return context.redirect("/login");
}