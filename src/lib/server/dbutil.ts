export async function insertAndReturnId(db : D1Database, sql: string, bind:unknown[]): Promise<number|null> {
  
  try {
    let stmt = db.prepare(sql);
    if (stmt && bind.length > 0){
      stmt = stmt.bind(...bind);
    }
    const { success } = await stmt.run()
    if (success){
      let last_insert_rowid  = await db.prepare('SELECT last_insert_rowid() as lastInsertId').first('lastInsertId');
      if (last_insert_rowid){
        return Number(last_insert_rowid)
      }else {
        throw new Error('Insert failed')
      }
    }else{
      throw new Error('Insert failed')
    }
  } catch (error) {
    return null
  }
}

export async function insert(db : D1Database, sql: string, bind:unknown[]): Promise<Boolean|null> { 
  try {
    let stmt = db.prepare(sql);
    if (stmt && bind.length > 0){
      stmt = stmt.bind(...bind);
    }
    const { success } = await stmt.run()
    if (success){
      return success
    }else{
      throw new Error('Insert failed')
    }
  } catch (error) {
    throw error;
  }
}


// 插入记录并返回自增主键
export async function insertRecordReturnId(db : D1Database,table: string, data: Record<string, any>): Promise<number|null> {
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);
  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  await db.prepare(query).bind(...values).run();
  const result = await db.prepare('SELECT last_insert_rowid() as id').first();
  return result === null ? null : Number(result.id);
}

// 查询记录
export async function queryRecords(db : D1Database,table: string, conditions: Record<string, any> = {}): Promise<any> {
  const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
  const values = Object.values(conditions);
  const query = `SELECT * FROM ${table}` + (whereClause ? ` WHERE ${whereClause}` : '');
  const results = await db.prepare(query).bind(...values).all();
  return results;
}

// 更新记录
export async function updateRecord(db : D1Database,table: string, data: Record<string, any>, conditions: Record<string, any>): Promise<void> {
  const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
  const values = [...Object.values(data), ...Object.values(conditions)];
  const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  await db.prepare(query).bind(...values).run();
}

// 执行SQL
export async function execSql(db : D1Database,query: string, params: any[] = []): Promise<void> {
  await db.prepare(query).bind(...params).run();
}


export async function d1QueryFirst(d1 :D1Database, sql: string, params: any[] = []) : Promise<any>{
  let stmt = d1.prepare(sql);
  // Bind the parameters if any to the prepared statement
  if (params&&params.length>0){
      stmt = stmt.bind(...params);
  }
  const results  = await stmt.first();
  return results;
}



export interface Page<T> {
  records: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function queryPage<T>(
  db: D1Database,
  table: string,
  page: number = 1,
  pageSize: number = 10,
  conditions: Record<string, any> = {},
  orderBy?: string
): Promise<Page<T>> {
  const offset = (page - 1) * pageSize;
  const whereClause = Object.keys(conditions).length > 0 
    ? `WHERE ${Object.keys(conditions).map(key => `${key} = ?`).join(' AND ')}`
    : '';
  const values = Object.values(conditions);
  
  // Query records
  const query = `SELECT * FROM ${table} ${whereClause} ${
    orderBy ? `ORDER BY ${orderBy}` : ''
  } LIMIT ? OFFSET ?`;
  const records = await db.prepare(query).bind(...values, pageSize, offset).all();
  
  // Query total count
  const countQuery = `SELECT COUNT(*) as total FROM ${table} ${whereClause}`;
  const { total } = await db.prepare(countQuery).bind(...values).first();
  
  return {
    records: records.results as T[],
    total: Number(total),
    page,
    pageSize,
    totalPages: Math.ceil(Number(total) / pageSize)
  };
}

export async function d1Query(d1 :D1Database, sql: string, params: any[] = []) : Promise<any>{
  /**
   * A utility function for executing SQL queries on a Cloudflare D1 database.
   *
   * Args:
   *     d1: The D1 database binding.
   *     sql: The SQL query string.
   *     params: An optional object of binding parameters.
   *
   * Returns:
   *     For SELECT queries, returns an array of records.
   *     For other queries (INSERT, UPDATE, DELETE), returns the number of affected rows.
   *     Returns an error object if an exception occurs.
   */
  let stmt = d1.prepare(sql);
  // Bind the parameters if any to the prepared statement
  if (params&&params.length>0){
      stmt = stmt.bind(...params);
  }
    // Check if the query is a SELECT query
  if (sql.trim().toLowerCase().startsWith("select")) {
      // Execute a SELECT query and return results
      const { results } = await stmt.all();
      return results;
  } else {
      // Execute a non-SELECT query (INSERT, UPDATE, DELETE) and return changes
      const changes  = await stmt.run();
      return changes;
  }
}
