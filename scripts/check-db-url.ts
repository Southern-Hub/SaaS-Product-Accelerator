import { config } from 'dotenv';
import { resolve } from 'path';

// Explicitly load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

console.log('🔍 Checking DATABASE_URL format...\n');

const url = process.env.DATABASE_URL;

if (!url) {
    console.error('❌ DATABASE_URL is not set!');
    process.exit(1);
}

console.log('✅ DATABASE_URL is set');
console.log('📋 Format check:');
console.log(`   - Starts with 'postgresql://': ${url.startsWith('postgresql://') ? '✅' : '❌ NO - this is the problem!'}`);
console.log(`   - Starts with 'postgres://': ${url.startsWith('postgres://') ? '✅ (will be normalized)' : '❌'}`);
console.log(`   - Length: ${url.length} characters`);
console.log(`   - Preview: ${url.substring(0, 50)}...`);

// Try to parse the URL
try {
    const parsed = new URL(url);
    console.log('\n📊 Parsed connection details:');
    console.log(`   - Protocol: ${parsed.protocol}`);
    console.log(`   - Host: ${parsed.hostname}`);
    console.log(`   - Port: ${parsed.port || '(default)'}`);
    console.log(`   - Database: ${parsed.pathname.substring(1)}`);
    console.log(`   - Username: ${parsed.username}`);

    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        console.log('\n⚠️  WARNING: Connection string points to localhost!');
        console.log('   This should be a Supabase URL like:');
        console.log('   postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres');
    } else {
        console.log('\n✅ Connection string looks correct!');
    }
} catch (error) {
    console.error('\n❌ Failed to parse URL:', error);
}
