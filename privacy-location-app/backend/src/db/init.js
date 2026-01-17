require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const initDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log('🗄️  Initializing database...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        public_key TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Circles table (groups of users)
    await client.query(`
      CREATE TABLE IF NOT EXISTS circles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Circle members
    await client.query(`
      CREATE TABLE IF NOT EXISTS circle_members (
        id SERIAL PRIMARY KEY,
        circle_id INTEGER REFERENCES circles(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(circle_id, user_id)
      );
    `);

    // Encrypted locations (stored with end-to-end encryption)
    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        encrypted_data TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_locations_user_timestamp
      ON locations(user_id, timestamp DESC);

      CREATE INDEX IF NOT EXISTS idx_locations_expires
      ON locations(expires_at) WHERE expires_at IS NOT NULL;
    `);

    // Privacy zones (places where location is hidden)
    await client.query(`
      CREATE TABLE IF NOT EXISTS privacy_zones (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        encrypted_coordinates TEXT NOT NULL,
        radius_meters INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Location sharing permissions
    await client.query(`
      CREATE TABLE IF NOT EXISTS sharing_permissions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        circle_id INTEGER REFERENCES circles(id) ON DELETE CASCADE,
        share_location BOOLEAN DEFAULT true,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, circle_id)
      );
    `);

    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - circles');
    console.log('   - circle_members');
    console.log('   - locations');
    console.log('   - privacy_zones');
    console.log('   - sharing_permissions');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initDatabase };
