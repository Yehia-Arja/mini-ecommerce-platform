import {
  Pool,
  type PoolClient,
  type QueryResult,
  type QueryResultRow,
} from "pg";

export class Database {
  readonly pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
    });
  }

  query<T extends QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, values ? [...values] : undefined);
  }

  async withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
