import type { APIRoute } from 'astro';
import { deleteSessionTokenCookie } from '@/lib/server/session';

export const GET: APIRoute = async (context) => {
  console.log('[DEBUG] Clearing all session cookies');
  
  // 删除session cookie
  deleteSessionTokenCookie(context);
  
  // 也删除GitHub OAuth state cookie
  context.cookies.delete('github_oauth_state', { path: '/' });
  context.cookies.delete('github_oauth_state', { path: '/', domain: context.url.hostname });
  context.cookies.delete('github_oauth_state', { path: '/', domain: `.${context.url.hostname}` });
  
  console.log('[DEBUG] All cookies cleared successfully');
  
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'All cookies cleared successfully' 
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};