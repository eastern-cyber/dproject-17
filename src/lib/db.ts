import postgres from 'postgres';

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

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

// Validate DATABASE_URL format (without Zod)
if (!databaseUrl) {
  console.warn('DATABASE_URL environment variable is not set');
  console.warn('Database functionality will be disabled in production');
} else if (!databaseUrl.startsWith('postgresql://')) {
  console.warn('DATABASE_URL does not start with postgresql://');
  console.warn('Unexpected format:', databaseUrl);
}

// Create the database connection only if DATABASE_URL is available
const sql = databaseUrl 
  ? postgres(databaseUrl, {
      ssl: process.env.NODE_ENV === 'production' ? 'require' : 'allow',
      idle_timeout: 20,
      max_lifetime: 60 * 10,
      transform: {
        undefined: null,
      },
    })
  : null;

// Helper function for health checks
export const checkDatabaseHealth = async (): Promise<boolean> => {
  if (!sql) {
    console.warn('Database connection not available - DATABASE_URL not set');
    return false;
  }
  
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
  if (sql) {
    await sql.end();
  }
};

// Export the typed SQL instance
export default sql;