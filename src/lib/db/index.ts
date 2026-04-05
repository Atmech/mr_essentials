import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Provide a dummy connection string during Next.js build time to prevent neon() from throwing
const connectionString = process.env.DATABASE_URL || 'postgres://dummy:dummy@dummy/dummy';
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
