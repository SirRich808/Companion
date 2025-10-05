import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('VITE_SUPABASE_URL is not defined. Supabase client will not be initialized.');
}

if (!supabaseAnonKey) {
  console.warn('VITE_SUPABASE_ANON_KEY is not defined. Supabase client will not be initialized.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : undefined;
