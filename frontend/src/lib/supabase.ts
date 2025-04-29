import { createClient as createBrowserClient } from "@/utils/supabase/client";

// 後方互換性のために残す
export const supabase = createBrowserClient();

// 新しい関数も提供
export const createClient = createBrowserClient;
