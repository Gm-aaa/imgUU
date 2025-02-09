import type { Website } from "@/types";
import * as websiteSql from "@/sql/websiteSql"


export async function queryWebsiteListByUserId(db: D1Database, userId: string): Promise<Website[]> {
    const result = await websiteSql.selectWebsiteByUserIdSql(db, userId);
    if (!result) {
        return [];
    }
    const websites: Website[] = [];
    // results.forEach(element => {
      
    // });

    const website: Website = {
      id: result.id as number,
      storageId: result.storage_id as number,
      domain: result.domain as string,
      cdnDomain: result.cdn_domain as string,
      userId: result.user_id as string,
      pathTemplate: result.path_template as string
    };
    websites.push(website);
    return websites;
}