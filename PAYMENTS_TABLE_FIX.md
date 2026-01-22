# Payments Table Fix

## Issue
The `payments` table doesn't exist in the database, causing payment confirmation to fail.

## Solution

### Option 1: Run SQL directly (Recommended)

1. **Connect to your database** using your database client (pgAdmin, DBeaver, etc.) or terminal:
   ```bash
   psql -U your_username -d pickmylab_db
   ```

2. **Run the migration SQL**:
   ```sql
   -- Copy and paste the contents of create_payments_table.sql
   -- Or run:
   \i create_payments_table.sql
   ```

### Option 2: Using psql command line

```bash
# Replace 'your_username' with your actual database user
psql -U your_username -d pickmylab_db -f create_payments_table.sql
```

### Option 3: Using Node.js script

Create a temporary script to run the migration:

```javascript
// run_migration.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER || 'your_username',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pickmylab_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'create_payments_table.sql'),
      'utf8'
    );
    await client.query(sql);
    console.log('✅ Payments table created successfully!');
  } catch (error) {
    console.error('❌ Error creating payments table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
```

Then run:
```bash
cd backend
node ../run_migration.js
```

## Verify Table Creation

After running the migration, verify the table exists:

```sql
-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'payments'
);

-- View table structure
\d payments
```

## What This Creates

- **payments table** with all required columns
- **Indexes** for better query performance
- **Trigger** for automatic `updated_at` updates
- **Foreign key constraints** to bookings and users

## After Creating the Table

1. **Restart your backend server** (if running)
2. **Test payment flow**:
   - Create a booking
   - Go to payment page
   - Complete payment
   - Should work without errors now!

---

**Once the table is created, payment confirmation will work correctly!** ✅
