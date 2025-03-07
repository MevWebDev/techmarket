import { Pool, QueryResult } from "pg";
import dotenv from "dotenv";

dotenv.config();

export interface QueryParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isAvailable?: boolean;
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

export const query = <T extends QueryResult = any>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T>> => {
  return new Promise((resolve, reject) => {
    pool.query<T>(text, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

export default pool;
