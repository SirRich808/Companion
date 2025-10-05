import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.SUPABASE_DB_URL;

console.log('Testing Supabase connection...');
console.log('Connection string:', connectionString ? connectionString.replace(/:[^:@]+@/, ':****@') : 'NOT FOUND');

if (!connectionString) {
  console.error('❌ SUPABASE_DB_URL not found in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
});

const testConnection = async () => {
  try {
    console.log('Attempting connection...');
    const client = await pool.connect();
    console.log('✅ Connection successful!');
    
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('\nDatabase info:');
    console.log('- Database:', result.rows[0].current_database);
    console.log('- User:', result.rows[0].current_user);
    console.log('- Version:', result.rows[0].version.split(' ').slice(0, 2).join(' '));
    
    client.release();
    await pool.end();
    console.log('\n✅ Connection test passed! Ready to run db:setup');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 DNS resolution failed. Possible issues:');
      console.error('   - Check your internet connection');
      console.error('   - Verify the Supabase host is correct');
      console.error('   - Try using a different DNS server');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Authentication failed. Check:');
      console.error('   - Database password is correct');
      console.error('   - User has proper permissions');
    } else if (error.message.includes('EHOSTUNREACH')) {
      console.error('\n💡 Host unreachable. Possible issues:');
      console.error('   - Firewall blocking connection');
      console.error('   - VPN interfering with connection');
      console.error('   - Supabase service might be down');
    }
    
    await pool.end();
    process.exit(1);
  }
};

testConnection();
