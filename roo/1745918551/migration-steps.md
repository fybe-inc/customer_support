# Supabase認証システム移行ステップ

このドキュメントでは、現在のSupabase認証システムからsupabase-frameベースの実装への移行に必要な具体的なステップを詳細に説明します。

## 前提条件

- Node.js 18.x以上
- Next.js 14.x以上
- Supabase プロジェクトへのアクセス

## 1. パッケージの更新

### 1.1 必要なパッケージのインストール

```bash
npm install @supabase/ssr
```

### 1.2 不要なパッケージの削除（移行完了後）

```bash
npm uninstall @supabase/auth-helpers-nextjs
```

## 2. ディレクトリ構造の更新

### 2.1 新しいディレクトリ構造の作成

```
frontend/src/utils/supabase/
├── client.ts  # クライアント側のSupabaseクライアント
└── server.ts  # サーバー側のSupabaseクライアント
```

## 3. Supabaseクライアントの実装

### 3.1 クライアント側のSupabaseクライアント（client.ts）

```typescript
import { createBrowserClient } from "@supabase/ssr";

// 環境変数のチェック
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL環境変数が設定されていません');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY環境変数が設定されていません');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
```

### 3.2 サーバー側のSupabaseクライアント（server.ts）

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// 環境変数のチェック
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL環境変数が設定されていません');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY環境変数が設定されていません');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createClient() {
  const cookieStore = await cookies();  // Next.js 15以降では await が必須

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Server Component で書き込みが呼ばれる場合もあるため try/catch
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

### 3.3 既存のsupabase.tsの更新（オプション）

既存の`frontend/src/lib/supabase.ts`ファイルは、後方互換性のために残すこともできますが、新しいクライアント作成関数を使用するように更新することをお勧めします：

```typescript
import { createClient as createBrowserClient } from '@/utils/supabase/client';

// 後方互換性のために残す
export const supabase = createBrowserClient();

// 新しい関数も提供
export const createClient = createBrowserClient;
```

## 4. ミドルウェアの更新

### 4.1 middleware.tsの更新

```typescript
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// 環境変数のチェック
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

  // ユーザー情報を取得（トークンを再検証）
  const { data: { user } } = await supabase.auth.getUser();

  // 認証が必要なページへのアクセスをチェック
  const protectedPaths = ['/manual', '/products', '/scenarios'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // 認証されていないユーザーが保護されたページにアクセスしようとした場合
  if (!user && isProtectedPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth';
    return NextResponse.redirect(redirectUrl);
  }

  // 認証済みユーザーが認証ページにアクセスした場合はホームページにリダイレクト
  if (user && request.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }
  
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
};
```

## 5. 認証コンポーネントの更新

### 5.1 Login.tsxの更新

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // クライアント作成
      const supabase = createClient();
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // ログイン成功時はホームページにリダイレクト
      router.push('/');
      router.refresh();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 残りのコンポーネントコードは変更なし
}
```

### 5.2 SignUp.tsxの更新

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // クライアント作成
      const supabase = createClient();
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      // サインアップ成功時のメッセージ
      setMessage('登録確認メールを送信しました。メールを確認してください。');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 残りのコンポーネントコードは変更なし
}
```

### 5.3 LogoutButton.tsxの更新

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className = '' }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      // クライアント作成
      const supabase = createClient();
      
      await supabase.auth.signOut();
      router.push('/auth'); // ログアウト後は認証ページにリダイレクト
      router.refresh();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 残りのコンポーネントコードは変更なし
}
```

### 5.4 AuthContextの作成（オプション）

現在のプロジェクトにAuthContextが存在しない場合は、作成することをお勧めします：

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 初期ユーザー状態を設定
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    initUser();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

## 6. APIルートの更新

### 6.1 getResponse/route.tsの更新

```typescript
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import type { AIResponse } from '@/types/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // サーバーサイド用のSupabaseクライアント作成
    const supabase = await createClient();
    
    // ユーザー情報を取得（トークンを再検証）
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // 認証されていない場合は401エラーを返す
    if (userError || !user) {
      return NextResponse.json(
        { 
          scenarios: [{
            reply: "認証エラー: ログインが必要です。",
            scenarioType: "エラー",
            notes: "認証されていないユーザー",
            sentiment: "neutral"
          }]
        },
        { status: 401 }
      );
    }

    const { inquiry, manuals, products, scenarios } = await request.json();

    // 以下、既存のコード
    // ...
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      scenarios: [{
        reply: "申し訳ございません。AIサービスとの通信中にエラーが発生しました。",
        scenarioType: "エラー",
        notes: "API通信エラー",
        sentiment: "neutral"
      }]
    }, { status: 500 });
  }
}
```

## 7. データフックの更新

### 7.1 useSupabaseData.tsの更新

```typescript
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { ManualEntry, ProductEntry, Scenario } from '@/types/types';

// マニュアルデータを取得するフック
export function useSupabaseManuals() {
  const [manuals, setManuals] = useState<ManualEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManuals = async () => {
      try {
        setLoading(true);
        
        // クライアント作成
        const supabase = createClient();
        
        // ユーザー情報を取得
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // 認証されていない場合は空の配列を返す
          setManuals([]);
          return;
        }

        // 以下、既存のコード
        // ...
      } catch (error: any) {
        console.error('マニュアルデータの取得エラー:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchManuals();
  }, []);

  // マニュアルを追加する関数
  const addManual = async (content: string) => {
    try {
      // クライアント作成
      const supabase = createClient();
      
      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('認証されていません');
      }

      // 以下、既存のコード
      // ...
    } catch (error: any) {
      console.error('マニュアル追加エラー:', error);
      setError(error.message);
      return false;
    }
  };

  // 以下、他のメソッドも同様に更新
  // ...

  return { manuals, loading, error, addManual, deleteManual };
}

// 他のフックも同様に更新
// ...
```

## 8. ユーザーセッションAPIの追加（オプション）

サーバー側でユーザーセッション情報を取得するためのAPIを追加することをお勧めします：

```typescript
// frontend/src/app/api/user-session/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    // サーバーサイド用のSupabaseクライアント作成
    const supabase = await createClient();

    // ユーザー情報を取得（トークンを再検証）
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (user) {
      // セッション情報を取得（必要な場合）
      const { data: { session } } = await supabase.auth.getSession();
      
      // レスポンスとしてユーザー情報の一部を返す
      return NextResponse.json({
        status: 'success',
        user: {
          id: user.id,
          email: user.email,
        }
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'ユーザーセッションが見つかりません',
      }, { status: 401 });
    }
  } catch (error) {
    console.error('セッション取得エラー:', error);
    return NextResponse.json({
      status: 'error',
      message: 'セッション情報の取得中にエラーが発生しました',
    }, { status: 500 });
  }
}
```

## 9. テスト

各コンポーネントとAPIルートが正しく動作することを確認するためのテストを行います：

1. ログイン機能のテスト
2. サインアップ機能のテスト
3. ログアウト機能のテスト
4. 保護されたルートへのアクセス制御のテスト
5. APIルートの認証チェックのテスト
6. データフックの動作確認

## 10. デプロイ

移行が完了したら、新しいコードをデプロイします。デプロイ前に以下を確認してください：

1. 環境変数が正しく設定されていること
2. すべてのテストが成功していること
3. 本番環境でのSupabaseプロジェクト設定が正しいこと

## 11. 後方互換性の削除（オプション）

移行が完了し、すべてが正常に動作していることを確認したら、古いコードと不要なパッケージを削除できます：

1. `@supabase/auth-helpers-nextjs`パッケージのアンインストール
2. 古い`supabase.ts`ファイルの削除（または完全に新しい実装に置き換え）

## 注意事項

- 移行中は、一時的に両方の実装が共存する可能性があります。これは問題ありませんが、最終的には新しい実装に完全に移行することをお勧めします。
- 環境変数の名前は同じですが、新しい実装ではより厳格なチェックが行われます。
- セッション管理の方法が変わるため、ユーザーは再ログインが必要になる可能性があります。