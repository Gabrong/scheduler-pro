import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: any = null;
let initialized = false;

export const getSupabaseClient = () => {
  // Only initialize if we have valid environment variables
  if (!initialized) {
    initialized = true;
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
      try {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
        supabaseClient = null;
      }
    }
  }
  return supabaseClient;
};

// Export a lazy-initialized client
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      console.warn('Supabase client not initialized. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
      return undefined;
    }
    return (client as any)[prop];
  },
});
