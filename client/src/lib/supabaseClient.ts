import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function getSupabaseImageUrl(path: string, width = 400, quality = 80) {
  if (!supabaseUrl) return path;
  if (/^https?:\/\//.test(path) || path.startsWith("data:")) return path;
  return `${supabaseUrl}/storage/v1/render/image/public/catalogue/${path}?width=${width}&quality=${quality}`;
}
