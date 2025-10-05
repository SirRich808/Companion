import dotenv from 'dotenv';
import { Pool } from 'pg';
import dns from 'dns';
import { promisify } from 'util';

// Force IPv4 preference globally for Node.js DNS resolution
dns.setDefaultResultOrder('ipv4first');

const resolve4 = promisify(dns.resolve4);

// Load environment variables (fallback to .env if .env.local missing)
const envResult = dotenv.config({ path: '.env.local' });
if (envResult.error && process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error('SUPABASE_DB_URL is not defined. Update .env.local with your Supabase connection string.');
}

const parseConfigFromUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    return {
      host: url.hostname,
      port: Number(url.port || 5432),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname?.replace('/', '') ?? undefined,
    };
  } catch (error) {
    throw new Error(`Invalid SUPABASE_DB_URL provided: ${error.message}`);
  }
};

const baseConfig = parseConfigFromUrl(connectionString);

// Try to resolve to IPv4 address to avoid IPv6 routing issues
let resolvedHost = baseConfig.host;
let ipv4Resolved = false;

try {
  const addresses = await resolve4(baseConfig.host);
  if (addresses && addresses.length > 0) {
    resolvedHost = addresses[0];
    ipv4Resolved = true;
    console.log(`✓ Resolved ${baseConfig.host} to IPv4: ${resolvedHost}`);
  }
} catch (error) {
  console.warn(`Could not resolve IPv4 for ${baseConfig.host}, will try direct connection`);
}

// Supabase requires SSL
// IMPORTANT: Do NOT use connectionString property - it bypasses DNS resolution
// Use explicit config to ensure our IPv4 resolution is respected
export const pool = new Pool({
  user: baseConfig.user,
  password: baseConfig.password,
  host: resolvedHost,
  port: baseConfig.port,
  database: baseConfig.database,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
    servername: baseConfig.host, // Use original hostname for SSL verification
  },
  max: Number(process.env.DB_POOL_MAX ?? 5),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT ?? 30_000),
  connectionTimeoutMillis: 10_000,
  allowExitOnIdle: true,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

export const withClient = async (handler) => {
  const client = await pool.connect();
  try {
    return await handler(client);
  } finally {
    client.release();
  }
};

export const ensureHealthyConnection = async () => {
  const { rows } = await pool.query('select 1 as ok');
  return rows[0]?.ok === 1;
};
