import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '../env/index.js';
import * as schema from './schemas/index.js';

const sql = neon(env.DATABASE_URL!);

export const appDb = drizzle(sql, { schema: schema });
