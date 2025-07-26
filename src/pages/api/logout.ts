import type { APIContext } from "astro";
import { deleteSessionTokenCookie, invalidateSession } from "@/lib/server/session";

export async function POST(context: APIContext): Promise<Response> {
  if (!context.locals.session) {
    return new Response(null, {
      status: 401,
    });
  }

  const { MY_DB } = context.locals.runtime.env;
  
  // 从数据库中删除session记录
  await invalidateSession(MY_DB, context.locals.session.id);
  
  // 删除session cookie
  deleteSessionTokenCookie(context);
  context.locals.session = null;
  context.locals.user = null;
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}