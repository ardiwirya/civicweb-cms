import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "PUBLIC_SUPABASE_URL dan PUBLIC_SUPABASE_ANON_KEY wajib diisi di .env"
  );
}

// Client ini pakai anon key dan tunduk pada RLS policy di database.
// Dipakai di Astro pages (public site) maupun React admin app.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
