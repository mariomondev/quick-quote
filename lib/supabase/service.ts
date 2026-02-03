import "server-only";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Supabase client using a secret API key — bypasses RLS.
 * Only use server-side for operations that don't have a user session
 * (e.g. public quote pages, public checkout).
 */
export function createServiceClient() {
  if (!env.SUPABASE_SECRET_KEY) {
    throw new Error("SUPABASE_SECRET_KEY is not configured");
  }

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    {
      auth: { persistSession: false },
    }
  );
}
