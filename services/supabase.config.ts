// Supabase configuration is loaded from environment variables.
// Copy .env.example to .env and fill in your own project values.
// Never commit real keys or a service_role key to this repository.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const SUPABASE_CONFIG = {
  url: supabaseUrl ?? 'https://placeholder.supabase.co',
  anonKey: supabaseAnonKey ?? 'placeholder-anon-key',
};
