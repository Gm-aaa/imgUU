import type { APIContext } from "astro";
import {getQueryParams} from '@/lib/utils/commonutil'
import * as uploadSql from '@/sql/uploadSql'

export async function GET(context: APIContext): Promise<Response> {
  try {
    const { MY_DB } = context.locals.runtime.env;
    const user = context.locals.user;
    const request = await context.request

    const queryParams = getQueryParams(request.url, 'page', 'limit')
    const page = queryParams['page']
    const limit = queryParams['limit']

    const uploadsPage = await  uploadSql.queryPageSql(MY_DB, Number(page), Number(limit), user.id)

    // 返回成功响应
    return new Response(
      JSON.stringify({
        success: true,
        data: uploadsPage
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}
