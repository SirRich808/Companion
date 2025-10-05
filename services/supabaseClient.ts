import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInitError: Error | null = null;
let supabaseClient: SupabaseClient | null = null;

const validateEnvironment = () => {
  if (!supabaseUrl) {
    return new Error('VITE_SUPABASE_URL is not defined. Update .env.local with your Supabase project URL.');
  }

  if (!supabaseAnonKey) {
    return new Error('VITE_SUPABASE_ANON_KEY is not defined. Update .env.local with your Supabase anon key.');
  }

  try {
    new URL(supabaseUrl);
  } catch (error) {
    return new Error(`VITE_SUPABASE_URL must be a valid URL. Received: ${supabaseUrl}`);
  }

  return null;
};

const initialiseClient = () => {
  const configError = validateEnvironment();
  if (configError) {
    supabaseInitError = configError;
    console.error(configError.message);
    return null;
  }

  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
};

supabaseClient = initialiseClient();

export const supabase = supabaseClient;

export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseClient) {
    return supabaseClient;
  }

  throw supabaseInitError ?? new Error('Supabase client has not been initialised.');
};

export const supabaseClientError = supabaseInitError;
