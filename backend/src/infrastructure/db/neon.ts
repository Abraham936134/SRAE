import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

let sql: any;

if (process.env.NODE_ENV === 'test') {
  sql = async () => [];
} else {
  sql = neon(process.env.DATABASE_URL!);
}

export default sql;
