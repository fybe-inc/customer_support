# Supabase実装の分析

## 現在の実装とsupabase-frameの比較

このドキュメントでは、現在のプロジェクトのSupabase実装とsupabase-frameの実装を比較分析します。

## 1. パッケージと依存関係

### 現在の実装
- `@supabase/supabase-js` - 基本的なSupabaseクライアント
- `@supabase/auth-helpers-nextjs` - Next.js用の認証ヘルパー

### supabase-frame
- `@supabase/supabase-js` - 基本的なSupabaseクライアント
- `@supabase/ssr` - 新しいSSR（Server-Side Rendering）対応のSupabaseクライアント

**主な違い**: supabase-frameでは、より新しい`@supabase/ssr`パッケージを使用しており、これはNext.jsのApp Routerとより良く統合されています。

## 2. クライアント初期化

### 現在の実装
```typescript
// frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

単一のクライアントインスタンスを作成し、クライアント側とサーバー側の両方で使用しています。

### supabase-frame
```typescript
// クライアント側
// frontend/src/utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// サーバー側
// frontend/src/utils/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as CookieOptions)
            );
          } catch {/* no-op */}
        },
      },
    }
  );
}
```

**主な違い**: supabase-frameでは、クライアント側とサーバー側で別々のクライアント作成関数を提供しています。これにより、それぞれの環境に最適化されたクライアントを使用できます。

## 3. ミドルウェア

### 現在の実装
```typescript
// frontend/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();

  // 認証が必要なページへのアクセスをチェック
  const protectedPaths = ['/manual', '/products', '/scenarios'];
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );

  if (!session && isProtectedPath) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth';
    return NextResponse.redirect(redirectUrl);
  }

  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}
```

### supabase-frame
```typescript
// frontend/src/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
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
```

**主な違い**: 
- supabase-frameでは`createServerClient`を使用しています（`createMiddlewareClient`の代わりに）
- Cookieの処理方法が異なります
- supabase-frameでは`getUser()`を使用してユーザー情報を取得しています（`getSession()`の代わりに）

## 4. 認証コンポーネント

### 現在の実装
- 個別のコンポーネント（Login.tsx, SignUp.tsx, LogoutButton.tsx）
- 各コンポーネントで直接supabaseクライアントを使用
- AuthContextが存在するが、実際のファイルが見つかりません

### supabase-frame
- プロフィールページでユーザー情報を表示
- クライアント側の`createClient()`関数を使用してSupabaseクライアントを作成
- 強制ログイン機能を実装（開発用）

**主な違い**: supabase-frameでは、クライアント作成関数を使用して各コンポーネントでSupabaseクライアントを作成しています。

## 5. APIルート

### 現在の実装
```typescript
// frontend/src/app/api/getResponse/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  // 認証チェック
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  // ユーザーのセッションを取得
  const { data: { session } } = await supabase.auth.getSession();
  
  // 認証されていない場合は401エラーを返す
  if (!session) {
    return NextResponse.json(
      { /* エラーレスポンス */ },
      { status: 401 }
    );
  }
  
  // 以下、APIの処理
}
```

### supabase-frame
```typescript
// frontend/src/app/api/user-session/route.ts
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    // サーバーサイド用のSupabaseクライアント作成
    const supabase = await createClient();

    // getUser() を使う──サーバー側で必ずトークンを再検証
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // 以下、APIの処理
  } catch (error) {
    // エラー処理
  }
}
```

**主な違い**: 
- supabase-frameでは独自の`createClient`関数を使用しています（`createRouteHandlerClient`の代わりに）
- supabase-frameでは`getUser()`を使用しています（`getSession()`の代わりに）

## 6. データフック

### 現在の実装
- `useSupabaseManuals`, `useSupabaseProducts`, `useSupabaseScenarios`などのカスタムフック
- 各フックで直接supabaseクライアントを使用
- 現在はLocalStorageを使用しているが、将来的にはSupabaseのテーブルを使用する予定

### supabase-frame
- 特定のデータフックは実装されていませんが、必要に応じて`createClient()`関数を使用してSupabaseクライアントを作成できます

**主な違い**: supabase-frameでは、データフックを実装する際に`createClient()`関数を使用することになります。

## 7. 環境変数

### 現在の実装
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### supabase-frame
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**主な違い**: 環境変数は同じですが、supabase-frameではより厳格なチェックが行われています。

## 結論

supabase-frameは、より最新のSupabase SDKを使用し、クライアント側とサーバー側で明確に分離されたアプローチを採用しています。これにより、Next.jsのApp Routerとより良く統合され、より堅牢なセッション管理が可能になります。移行には、パッケージの更新、クライアント初期化方法の変更、ミドルウェアの更新、認証コンポーネントの更新、APIルートの更新、データフックの更新が必要です。