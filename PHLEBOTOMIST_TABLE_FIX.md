# Phlebotomist Table Fix

## Issue
Error: `relation "phlebotomists" does not exist`

## Solution

The `phlebotomists` table has been created by the migration, but the backend server needs to be restarted to recognize it.

### Steps to Fix:

1. **Stop the backend server** (Ctrl+C in the terminal where it's running)

2. **Restart the backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Verify the table exists:**
   ```bash
   psql -U salahudheenpa -d pickmylab_db -c "\d phlebotomists"
   ```

4. **Refresh the phlebotomists page:**
   - Go to: http://localhost:3001/admin/phlebotomists
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### If Still Not Working:

Check if the backend is using the correct database:
```bash
# Check backend .env file
cat backend/.env | grep DB_NAME
# Should show: DB_NAME=pickmylab_db
```

### Table Structure:

The `phlebotomists` table has these columns:
- id (UUID)
- user_id (UUID, references users)
- license_number
- vehicle_type
- current_location_lat/lng
- availability_status (available, busy, offline, on_break)
- max_bookings_per_day
- current_bookings_count
- created_at, updated_at

### Note:

The database has both:
- `phlebotomists` table (for operational data - availability, bookings)
- `phlebotomist_profiles` table (for profile data - certifications, ratings)

Both tables are needed and serve different purposes.
