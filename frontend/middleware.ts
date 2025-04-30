// src/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/utils/supabase/server";

// 認証必須パス（トップは完全一致／それ以外は prefix で判定）
const protectedPagePaths = ["/", "/manual", "/products", "/scenarios"];

export const config = {
  matcher: [
    "/",                      // トップページ
    "/manual/:path*",         // /manual とその下位
    "/products/:path*",       // /products とその下位
    "/scenarios/:path*",      // /scenarios とその下位
    "/api/:path*",            // API 全般
  ],
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient(request, response);

  // セッション確認
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isApiPath = pathname.startsWith("/api");
  const isProtected = protectedPagePaths.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
  );

  // 未ログインかつ保護ページ or API なら
  if (!user && isProtected) {
    if (isApiPath) {
      return new NextResponse(
        JSON.stringify({ error: "認証が必要です" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // ログイン済みが /auth に来たらトップへ
  if (user && pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
