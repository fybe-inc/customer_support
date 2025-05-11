import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, type NextResponse } from "next/server";

// 環境変数のチェック
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL環境変数が設定されていません");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY環境変数が設定されていません");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createClient() {
  const cookieStore = await cookies(); // Next.js 15以降では await が必須

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Server Component で書き込みが呼ばれる場合もあるため try/catch
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as CookieOptions),
          );
        } catch {
          /* no-op */
        }
      },
    },
  });
}

/**
 * Middleware 用の Supabase クライアントを作る
 */
export function createMiddlewareSupabaseClient(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // NextRequest から全 Cookie を取ってくる
      getAll() {
        return request.cookies.getAll();
      },
      // Supabase が返す Cookie を NextResponse にセット
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set({ name, value, ...options }),
        );
      },
    },
  });
}
