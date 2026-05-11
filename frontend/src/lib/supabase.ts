import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase browser client — used throughout the frontend for auth & data.
 *
 * Requires these environment variables in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * If not configured, returns null — auth features will be disabled gracefully.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl !== "your-supabase-project-url" &&
  supabaseAnonKey !== "your-supabase-anon-key";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!isSupabaseConfigured) return null;

  if (!client) {
    client = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }
  return client;
}
