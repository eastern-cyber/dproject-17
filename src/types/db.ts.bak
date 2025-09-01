import postgres from 'postgres';
import { z } from 'zod';

// Environment variable validation
const databaseUrlSchema = z.string().url().startsWith('postgresql://');

// Database row interfaces for type safety
export interface UserRow {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface PostRow {
  id: number;
  user_id: number;
  title: string;
  content: string | null;
  created_at: Date;
  updated_at: Date;
}

// Validate DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || !databaseUrlSchema.safeParse(databaseUrl).success) {
  throw new Error(
    'Invalid or missing DATABASE_URL. Please check your environment variables.'
  );
}

// Create the database connection with proper TypeScript typing
const sql = postgres(databaseUrl, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : 'allow',
  idle_timeout: 20,
  max_lifetime: 60 * 10,
  transform: {
    // Handle undefined values by converting them to null
    undefined: null,
    // Properly parse PostgreSQL dates to JavaScript Date objects
    column: {
      // Convert timestamp columns to Date objects
      created_at: (value) => new Date(value),
      updated_at: (value) => new Date(value),
    },
  },
  // Type conversions for PostgreSQL to TypeScript
  types: {
    // Parse bigint as number (watch for precision issues with very large numbers)
    bigint: postgres.BigInt,
    // Parse date and timestamp as Date objects
    date: {
      to: 1184,
      from: [1082, 1083, 1114, 1184],
      serialize: (x: Date) => x.toISOString(),
      parse: (x: string) => new Date(x),
    },
  },
});

// Helper function for health checks
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const result = await sql`SELECT 1 as health_check`;
    return result.length > 0 && result[0].health_check === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Helper function to end the connection (useful for scripts)
export const endDatabaseConnection = async (): Promise<void> => {
  await sql.end();
};

// Export the typed SQL instance
export default sql;