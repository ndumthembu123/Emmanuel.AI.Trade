import { Pool } from 'pg';
import { logger } from './logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Database error', err);
});

export const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('✅ Database connection successful');
    await initializeTables();
  } catch (error) {
    logger.error('Database connection failed', error);
    throw error;
  }
};

const initializeTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS license_keys (
      id SERIAL PRIMARY KEY,
      key_hash VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255),
      ip_address INET,
      device_fingerprint VARCHAR(255),
      is_activated BOOLEAN DEFAULT FALSE,
      activated_at TIMESTAMP,
      is_revoked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      email VARCHAR(255),
      ip_address INET,
      device_fingerprint VARCHAR(255),
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS signals (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(20) NOT NULL,
      timeframe VARCHAR(10) NOT NULL,
      signal_type VARCHAR(10) NOT NULL,
      entry_price DECIMAL(20, 8),
      tp1_price DECIMAL(20, 8),
      tp2_price DECIMAL(20, 8),
      tp3_price DECIMAL(20, 8),
      sl_price DECIMAL(20, 8),
      strength INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol, timeframe)`
  ];

  try {
    for (const q of queries) {
      await pool.query(q);
    }
    logger.info('✅ Database tables initialized');
  } catch (error) {
    logger.error('Error initializing tables', error);
  }
};

export const query = (text: string, params?: any[]) => pool.query(text, params);
export { pool };
