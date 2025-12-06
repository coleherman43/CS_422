# Database Migration Instructions

## Migration: Update QR Token Column Length

This migration updates the `qr_code_token` column in the `attendance` table from `VARCHAR(100)` to `VARCHAR(500)` to accommodate longer QR code tokens.

## Option 1: Using Railway Web Interface (Easiest)

1. Go to your Railway project dashboard
2. Click on your PostgreSQL database service
3. Click on the **"Query"** or **"Data"** tab
4. Open the SQL editor/query interface
5. Copy and paste this SQL:

```sql
ALTER TABLE attendance 
ALTER COLUMN qr_code_token TYPE VARCHAR(500);

COMMENT ON COLUMN attendance.qr_code_token IS 'QR code token for validation (updated from VARCHAR(100) to VARCHAR(500))';
```

6. Click **"Run"** or **"Execute"**
7. Verify the change by running:

```sql
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'attendance' 
AND column_name = 'qr_code_token';
```

You should see `character_maximum_length = 500`

## Option 2: Using psql Command Line

1. Get your database connection string from Railway:
   - Go to your PostgreSQL service in Railway
   - Copy the `DATABASE_URL` or connection details

2. Connect using psql:

```bash
# If you have DATABASE_URL:
psql $DATABASE_URL

# Or manually:
psql -h <host> -U <user> -d <database> -p <port>
```

3. Run the migration:

```sql
ALTER TABLE attendance 
ALTER COLUMN qr_code_token TYPE VARCHAR(500);
```

4. Verify:

```sql
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'attendance' 
AND column_name = 'qr_code_token';
```

5. Exit psql: `\q`

## Option 3: Using the Migration Script

1. Make sure your `DATABASE_URL` is set in your `.env` file or environment

2. Run the migration script:

```bash
cd server
node scripts/runMigration.js db/migrations/001_update_qr_token_length.sql
```

The script will:
- Read the migration file
- Execute the SQL
- Verify the change was applied
- Show you the results

## Option 4: Using Railway CLI

If you have Railway CLI installed:

```bash
# Connect to your database
railway connect

# Then run the SQL
psql -c "ALTER TABLE attendance ALTER COLUMN qr_code_token TYPE VARCHAR(500);"
```

## After Running the Migration

Once the migration is complete, update the code to use the new limit:

1. In `server/controllers/eventController.js`, change:
   ```javascript
   const QR_TOKEN_MAX_LENGTH = 100; // Change this to 500
   ```
   to:
   ```javascript
   const QR_TOKEN_MAX_LENGTH = 500;
   ```

2. In `server/models/attendance.js`, change the truncation limit from 100 to 500 (or remove the truncation since 500 should be enough)

3. Restart your server

## Verification

After running the migration, you can verify it worked by checking the column:

```sql
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'attendance' 
AND column_name = 'qr_code_token';
```

Expected result:
- `data_type`: `character varying`
- `character_maximum_length`: `500`

## Troubleshooting

### Error: "relation does not exist"
- Make sure you're connected to the correct database
- Check that the `attendance` table exists

### Error: "permission denied"
- Make sure you're using a user with ALTER TABLE permissions
- Railway's default user should have these permissions

### Error: "column does not exist"
- Check the column name is correct: `qr_code_token`
- Verify the table structure: `\d attendance` (in psql)

## Rollback (if needed)

If you need to rollback the migration:

```sql
ALTER TABLE attendance 
ALTER COLUMN qr_code_token TYPE VARCHAR(100);
```

Note: This will truncate any tokens longer than 100 characters, so only do this if you haven't stored any long tokens yet.

