import { config } from 'dotenv';
import { resolve } from 'path';

// Explicitly load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

console.log('Environment check:');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL preview:', process.env.DATABASE_URL ?
    process.env.DATABASE_URL.substring(0, 30) + '...' : 'NOT SET');

import { testConnection, getPool } from '../lib/database';

async function main() {
    console.log('\n🔍 Testing Database Connection...\n');

    try {
        // Test basic connection
        const isConnected = await testConnection();

        if (!isConnected) {
            console.error('❌ Database connection failed!');
            console.error('Check your DATABASE_URL in .env.local');
            process.exit(1);
        }

        console.log('✅ Database connected successfully!\n');

        // Check tables exist
        const pool = getPool();
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        console.log('📊 Tables found:');
        if (tablesResult.rows.length === 0) {
            console.log('   ⚠️  No tables found. Please run the migration script.');
        } else {
            tablesResult.rows.forEach(row => {
                console.log(`   ✓ ${row.table_name}`);
            });
        }

        // Check indexes
        const indexesResult = await pool.query(`
            SELECT indexname 
            FROM pg_indexes 
            WHERE schemaname = 'public'
            ORDER BY indexname
        `);

        console.log('\n🔍 Indexes found:');
        indexesResult.rows.forEach(row => {
            console.log(`   ✓ ${row.indexname}`);
        });

        // Test insert into products table
        console.log('\n🧪 Testing insert...');
        const testInsert = await pool.query(`
            INSERT INTO products (product_slug, source, source_url, name, tagline)
            VALUES ('test-product', 'betalist', 'https://betalist.com/startups/test', 'Test Product', 'Test tagline')
            ON CONFLICT (product_slug) DO UPDATE SET updated_at = NOW()
            RETURNING id, product_slug
        `);

        console.log(`   ✅ Insert successful! Product ID: ${testInsert.rows[0].id}`);

        // Clean up test data
        await pool.query(`DELETE FROM products WHERE product_slug = 'test-product'`);
        console.log('   ✅ Test data cleaned up');

        console.log('\n🎉 All database tests passed!');
        console.log('\n📝 Summary:');
        console.log(`   - Connection: ✅ Working`);
        console.log(`   - Tables: ✅ ${tablesResult.rows.length} found`);
        console.log(`   - Indexes: ✅ ${indexesResult.rows.length} found`);
        console.log(`   - Write operations: ✅ Working`);

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Database test failed:', error);
        process.exit(1);
    }
}

main();
