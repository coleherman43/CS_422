# Running Migration Directly in Railway

Since your app runs on Railway and uses Railway's environment variables, here are ways to run the migration directly in Railway without needing the DATABASE_URL locally:

## Option 1: Railway CLI (Easiest if you have it)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run the SQL directly
railway run -s postgres psql -c "ALTER TABLE attendance ALTER COLUMN qr_code_token TYPE VARCHAR(500);"

# Or connect interactively
railway connect postgres
# Then in psql:
# ALTER TABLE attendance ALTER COLUMN qr_code_token TYPE VARCHAR(500);
```

## Option 2: Temporary Code Change (Run in Production)

You can temporarily add code to your app that runs on startup to check and update the schema:

1. Add this to your `server.js` or create a migration runner endpoint
2. Deploy to Railway
3. The code runs once and updates the database
4. Remove the code

## Option 3: Use Railway's Service Shell

If Railway has a shell/terminal access for your PostgreSQL service:
1. Open Railway dashboard
2. Click PostgreSQL service
3. Look for "Shell" or "Terminal" tab
4. Run: `psql -c "ALTER TABLE attendance ALTER COLUMN qr_code_token TYPE VARCHAR(500);"`

## Option 4: Quick API Endpoint (Temporary)

Create a temporary admin endpoint that runs the migration:

```javascript
// In your routes - TEMPORARY, REMOVE AFTER USE
router.post('/admin/migrate', async (req, res) => {
  try {
    const { query } = require('../config/db');
    await query('ALTER TABLE attendance ALTER COLUMN qr_code_token TYPE VARCHAR(500)');
    res.json({ success: true, message: 'Migration completed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

Then call it once:
```bash
curl -X POST https://your-railway-app.railway.app/api/admin/migrate
```

## Recommended: Option 1 (Railway CLI)

If you install Railway CLI, you can run the migration directly without needing local database credentials.

