/**
 * Script to create the payments table
 * Run this from the backend directory: node run_payments_migration.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pickmylab_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Creating payments table...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'src/migrations/create_payments_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query(sql);
    
    console.log('✅ Payments table created successfully!');
    console.log('✅ Indexes created successfully!');
    
    // Verify table exists
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payments'
      );
    `);
    
    if (result.rows[0].exists) {
      console.log('✅ Verification: payments table exists');
    } else {
      console.log('⚠️  Warning: Table verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error creating payments table:', error.message);
    
    // Check if table already exists
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Table already exists, skipping...');
    } else {
      console.error('Full error:', error);
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
