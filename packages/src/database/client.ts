import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '../env/index.js';
import * as schema from './schemas/index.js';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // ssl: true,
  ssl: false, // Required for local postgres. Set to true for neon.tech
});

export const appDb = drizzle(pool, { schema: schema });
