import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = connectionString 
  ? new Pool({ connectionString })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT) || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

// Test connection and execute auto-migrations
pool.connect(async (err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL database.');
    try {
      if (client) {
        await client.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

          ALTER TABLE quotations ADD COLUMN IF NOT EXISTS counter_budget NUMERIC(12,2);
          ALTER TABLE quotations ADD COLUMN IF NOT EXISTS counter_notes TEXT;
          ALTER TABLE quotations ADD COLUMN IF NOT EXISTS counter_by VARCHAR(20);
          
          ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_counter_by_check;
          ALTER TABLE quotations ADD CONSTRAINT quotations_counter_by_check CHECK (counter_by IN ('builder', 'contractor'));

          ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_status_check;
          ALTER TABLE quotations ADD CONSTRAINT quotations_status_check CHECK (status IN ('pending', 'countered', 'accepted', 'rejected'));
        `);
        console.log('PostgreSQL auto-migrations: user suspension and quotations table structure verified.');
      }
    } catch (migErr) {
      console.error('PostgreSQL auto-migration failed:', migErr);
    } finally {
      release();
    }
  }
});

// Event listener for errors on idle clients
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};

export default pool;
