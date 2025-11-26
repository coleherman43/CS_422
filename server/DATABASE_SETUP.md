# Database Setup Guide

This guide explains how to configure the database connection for the Flock Manager application.

## Quick Start

1. Copy `.env-example` to `.env`:
   ```bash
   cp .env-example .env
   ```

2. Edit `.env` and set your `DATABASE_URL`

3. Create the database (if it doesn't exist):
   ```bash
   createdb flock_manager
   # or using psql:
   psql -U postgres -c "CREATE DATABASE flock_manager;"
   ```

4. Run the schema:
   ```bash
   psql -U postgres -d flock_manager -f db/schema.sql
   ```

5. (Optional) Seed initial data:
   ```bash
   psql -U postgres -d flock_manager -f db/seed.sql
   ```

## Finding Your Database Connection String

### Local PostgreSQL

The `DATABASE_URL` format is:
```
postgresql://[username]:[password]@[host]:[port]/[database_name]
```

**Common local examples:**

1. **Default PostgreSQL installation:**
   ```bash
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/flock_manager
   ```

2. **Using your macOS username (peer authentication):**
   ```bash
   DATABASE_URL=postgresql://your_username@localhost:5432/flock_manager
   ```

3. **No password (trust authentication):**
   ```bash
   DATABASE_URL=postgresql://postgres@localhost:5432/flock_manager
   ```

### Finding Your Local PostgreSQL Info

**On macOS (using Homebrew):**
```bash
# Check if PostgreSQL is installed
psql --version

# Find your PostgreSQL username (usually your macOS username)
whoami

# Connect to PostgreSQL
psql -U postgres
# or
psql -U $(whoami)

# Once connected, list databases
\l

# Create the database if needed
CREATE DATABASE flock_manager;

# Exit psql
\q
```

**On Linux:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Connect (default user is usually 'postgres')
sudo -u postgres psql

# Or connect as your user
psql -U postgres
```

**On Windows:**
```bash
# Open Command Prompt as Administrator
# Navigate to PostgreSQL bin directory (usually C:\Program Files\PostgreSQL\XX\bin)
psql -U postgres
```

### Remote/Cloud Databases

For remote databases (Heroku, AWS RDS, DigitalOcean, etc.), you'll typically get a connection string like:

```
postgresql://user:password@host.example.com:5432/dbname?sslmode=require
```

Just copy the connection string provided by your hosting service.

## Testing Your Connection

After setting up your `.env` file, test the connection:

```bash
# From the server directory
node -e "require('dotenv').config(); const {pool} = require('./config/db'); pool.query('SELECT NOW()').then(r => {console.log('✅ Connected!', r.rows[0]); process.exit(0);}).catch(e => {console.error('❌ Error:', e.message); process.exit(1);})"
```

Or simply start the server:
```bash
npm run dev
```

If you see `Connected to PostgreSQL database` in the logs, you're good to go!

## Common Issues

### "database does not exist"
Create the database:
```bash
createdb flock_manager
# or
psql -U postgres -c "CREATE DATABASE flock_manager;"
```

### "password authentication failed"
- Check your password in the connection string
- Try using peer authentication (remove password): `postgresql://username@localhost:5432/flock_manager`
- Reset PostgreSQL password: `psql -U postgres -c "ALTER USER postgres PASSWORD 'newpassword';"`

### "connection refused"
- Check if PostgreSQL is running: `pg_isready` or `sudo systemctl status postgresql`
- Check the port (default is 5432)
- Check if PostgreSQL is listening on localhost: `netstat -an | grep 5432`

### "role does not exist"
- Use your macOS/Linux username instead of 'postgres'
- Or create the role: `psql -U postgres -c "CREATE USER your_username WITH PASSWORD 'password';"`

## Environment-Specific Configuration

### Development
```env
DATABASE_URL=postgresql://localhost:5432/flock_manager
NODE_ENV=development
```

### Production
```env
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/flock_manager?sslmode=require
NODE_ENV=production
```

## Security Notes

- **Never commit `.env` to version control** (it's in `.gitignore`)
- Use strong passwords for production databases
- Use SSL connections for remote databases
- Consider using connection pooling for production

