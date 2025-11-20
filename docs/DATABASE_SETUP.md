# Database Setup Guide

## Quick Setup (PostgreSQL)

This guide will help you set up the PostgreSQL database for the SaaS Viability Analyzer.

## Option 1: Supabase (Recommended - Free Tier Available)

1. **Create Account**: Go to [supabase.com](https://supabase.com) and sign up
2. **Create Project**: Click "New Project"
   - Choose organization (or create one)
   - Name: `saas-viability-analyzer`
   - Database Password: Generate strong password
   - Region: Choose closest to Australia (ap-southeast-1)
3. **Get Connection String**:
   - Go to Settings → Database
   - Copy "Connection string" under "Connection pooling"
   - It looks like: `postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
4. **Run Migration**:
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `db/migrations/001_create_unified_schema.sql`
   - Paste and click "Run"
5. **Update `.env.local`**:
   ```
   DATABASE_URL="<your-connection-string>"
   ```


## Verify Installation

Create a file `test-db.mjs` in your project root:

```javascript
import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/saas_viability_analyzer';

async function test() {
    const client = new pg.Client({ connectionString });
    
    try {
        await client.connect();
        console.log('✅ Database connected successfully!');
        
        // Check if tables exist
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('📊 Tables found:', result.rows.map(r => r.table_name));
        
        if (result.rows.length === 0) {
            console.log('⚠️  No tables found. Run the migration script.');
        }
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    } finally {
        await client.end();
    }
}

test();
```

Run it:
```bash
node test-db.mjs
```

Expected output:
```
✅ Database connected successfully!
📊 Tables found: [ 'products', 'product_analyses' ]
```

## Troubleshooting

### "Connection refused" error

- **Local**: Check if PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- **Supabase**: Check your internet connection and verify connection string

### "Password authentication failed"

- **Local**: Reset password: `psql -U postgres` then `ALTER USER postgres PASSWORD 'newpassword';`
- **Supabase**: Verify you copied the correct password from dashboard

### "Database does not exist"

```bash
createdb saas_viability_analyzer
```

### "Tables not found"

Run the migration script again:
```bash
psql $DATABASE_URL < db/migrations/001_create_unified_schema.sql
```

## Cost Considerations

### Supabase Free Tier
- ✅ 500MB database storage
- ✅ Unlimited API requests
- ✅ Perfect for development and small projects
- ✅ Automatic backups

### Supabase Pro ($25/month)
- 8GB database storage
- Better performance
- Daily backups

For this project, **Free Tier is sufficient** unless you're analyzing 1000+ products.

## Next Steps

Once database is set up:
1. ✅ Verify connection with test script
2. ✅ Analyze your first product
3. ✅ Check database for stored analysis
4. ✅ Try cache hit by re-analyzing same product
