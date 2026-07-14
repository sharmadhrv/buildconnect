"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL;
const pool = connectionString
    ? new pg_1.Pool({ connectionString })
    : new pg_1.Pool({
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
    }
    else {
        console.log('Successfully connected to PostgreSQL database.');
        try {
            if (client) {
                // Check if users table exists
                const tableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          );
        `);
                const usersTableExists = tableCheck.rows[0]?.exists;
                if (!usersTableExists) {
                    console.log('Database tables do not exist. Initializing database schema from schema.sql...');
                    const schemaPath = path_1.default.join(__dirname, 'schema.sql');
                    const schemaSql = fs_1.default.readFileSync(schemaPath, 'utf8');
                    await client.query(schemaSql);
                    console.log('Database schema initialized successfully.');
                    try {
                        console.log('Seeding initial database data from seed.sql...');
                        const seedPath = path_1.default.join(__dirname, 'seed.sql');
                        const seedSql = fs_1.default.readFileSync(seedPath, 'utf8');
                        await client.query(seedSql);
                        console.log('Database seed data loaded successfully.');
                    }
                    catch (seedErr) {
                        console.warn('Database seed failed (continuing):', seedErr);
                    }
                }
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
        }
        catch (migErr) {
            console.error('PostgreSQL auto-migration failed:', migErr);
        }
        finally {
            release();
        }
    }
});
// Event listener for errors on idle clients
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
            console.log('executed query', { text, duration, rows: res.rowCount });
        }
        return res;
    }
    catch (error) {
        console.error('Query execution error:', error);
        throw error;
    }
};
exports.query = query;
exports.default = pool;
