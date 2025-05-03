import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle({
  connection: {
    connectionString:
      'postgresql://neondb_owner:npg_uxM21tmVbHzW@ep-fragrant-cell-a1koaaz3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    ssl: process.env.NODE_ENV === 'production',
  },
});
