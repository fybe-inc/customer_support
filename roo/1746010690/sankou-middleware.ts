import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Supabaseクライアントの設定（ミドルウェア用）
// 環境変数を使用
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL環境変数が設定されていません');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY環境変数が設定されていません');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        /** 全 Cookie を Next.js の形式 → Supabase 用に変換 */
        getAll() {
          return request.cookies.getAll();  // [{ name, value, ... }]
        },
        /** Supabase が返してきた Cookie 群をレスポンスに反映 */
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set({ name, value, ...options })
          );
        },
      },
    }
  );

  // 毎リクエストでトークンを再検証
  const { data: { user } } = await supabase.auth.getUser();

  // 未ログインならログインページへ
  if (!user && !request.nextUrl.pathname.startsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
};