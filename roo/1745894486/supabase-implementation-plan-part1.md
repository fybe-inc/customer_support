# Supabase導入による認証とデータ管理の実装計画 (Part 1)

## 1. 概要と目的

現在のカスタマーサポートアプリケーションは、データ管理にLocalStorageを使用しており、ユーザー認証機能がありません。この計画では、以下の改善を行います：

1. **Supabaseによるユーザー認証の導入**
   - ユーザー登録・ログイン機能の実装
   - 認証状態の管理

2. **データ管理のSupabaseへの移行**
   - LocalStorageからSupabaseデータベースへのデータ移行
   - リアルタイムデータ同期の実装

3. **APIエンドポイントの保護**
   - 認証されていないユーザーからのAPIアクセスをブロック
   - 認証チェックミドルウェアの実装

## 2. Supabaseの導入

### 2.1 Supabaseプロジェクトのセットアップ

1. Supabaseアカウントの作成（既存のアカウントがある場合はスキップ）
2. 新しいプロジェクトの作成
3. プロジェクトURLとAPIキーの取得

### 2.2 Next.jsプロジェクトへのSupabase統合

1. 必要なパッケージのインストール

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
```

2. 環境変数の設定

```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Supabaseクライアントの設定

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 3. ユーザー認証の実装

### 3.1 認証関連のテーブル設定

Supabaseは認証に必要なテーブルを自動的に作成します（`auth.users`など）。

### 3.2 認証コンポーネントの作成

1. ログインコンポーネント

```typescript
// components/Auth/Login.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* フォーム要素 */}
    </form>
  );
}
```

2. 新規登録コンポーネント

```typescript
// components/Auth/SignUp.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      {/* フォーム要素 */}
    </form>
  );
}
```

3. ログアウト機能

```typescript
// components/Auth/LogoutButton.tsx
import { supabase } from '@/lib/supabase';

export default function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <button onClick={handleLogout}>
      ログアウト
    </button>
  );
}
```

### 3.3 認証状態の管理

1. 認証コンテキストの作成

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

2. アプリケーションへの認証コンテキストの適用

```typescript
// app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 3.4 認証ページの作成

```typescript
// app/auth/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Auth/Login';
import SignUp from '@/components/Auth/SignUp';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, loading } = useAuth();
  const router = useRouter();

  // ユーザーが既にログインしている場合はホームページにリダイレクト
  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>認証</h1>
      {authMode === 'login' ? (
        <>
          <Login />
          <button onClick={() => setAuthMode('signup')}>
            アカウントをお持ちでない方はこちら
          </button>
        </>
      ) : (
        <>
          <SignUp />
          <button onClick={() => setAuthMode('login')}>
            既にアカウントをお持ちの方はこちら
          </button>
        </>
      )}
    </div>
  );
}
```

### 3.5 認証ミドルウェアの実装

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 認証が必要なページへのアクセスをチェック
  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth';
    return NextResponse.redirect(redirectUrl);
  }

  // 認証済みユーザーが認証ページにアクセスした場合はホームページにリダイレクト
  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};