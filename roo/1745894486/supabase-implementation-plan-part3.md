# Supabase導入による認証とデータ管理の実装計画 (Part 3)

## 6. APIエンドポイントの保護

### 6.1 認証チェック関数の作成

```typescript
// utils/authCheck.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function checkAuth(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: '認証されていません' },
      { status: 401 }
    );
  }
  
  return null; // 認証成功
}
```

### 6.2 APIエンドポイントの修正

```typescript
// app/api/getResponse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { checkAuth } from '@/utils/authCheck';
import type { AIResponse } from '@/types/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  // 認証チェック
  const authError = await checkAuth(req);
  if (authError) return authError;
  
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // ユーザーIDを取得
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが取得できません' },
        { status: 401 }
      );
    }
    
    const { inquiry } = await req.json();
    
    // Supabaseからユーザーのデータを取得
    const { data: manuals } = await supabase
      .from('manuals')
      .select('content')
      .eq('user_id', userId);
    
    const { data: products } = await supabase
      .from('products')
      .select('content')
      .eq('user_id', userId);
    
    const { data: scenarios } = await supabase
      .from('scenarios')
      .select('title, prompt')
      .eq('user_id', userId);
    
    // システムプロンプトの構築
    const systemPrompt = `
    あなたは当社の「カスタマーサポート担当AI」です。以下の情報とルールに基づき、ユーザーのお問い合わせに対応する複数の返信シナリオを提案してください。
    
    以下の情報を参考にしてください：
    
    【マニュアル情報：ここについては厳守するようにしてください】
    ${manuals?.map((m) => `【厳守するルールです．以下のルールを適応させた返信文を作成ください．】・${m.content}`).join('\n\n')}
    
    【商品情報】
    ${products?.map((p) => p.content).join('\n\n')}
    
    【事前定義シナリオ】
    ${scenarios?.map((s) => `【${s.title}】\n${s.prompt}`).join('\n\n')}
    
    ---
    【あなたの役割・指示】
    1. **事前定義シナリオ**（上記で提供されたシナリオ）を必ず **一つずつ** 活用し、それぞれに対する返信文を提案してください。
       - 事前定義シナリオが3つあれば、少なくとも4つ以上シナリオ提案を行ってください（1シナリオにつき1返信文とAIが加えて考えた追加提案シナリオ）。
       - これらの事前定義シナリオは必ず**上位**に提示してください。
    2. **追加提案シナリオ（AI提案）**を、ユーザーの問い合わせ内容に合わせて**1〜2件**用意してください。
       - したがって、たとえば事前定義が3つあれば、合計4つか5つのシナリオが提案されることになります。
    3. **各シナリオ**について、以下の情報を**必ず**提供してください：
       - 具体的な返信メッセージ（reply）
       - シナリオの種類（scenarioType）：  
         ・事前定義シナリオの場合は **シナリオのタイトル**（例：「titleA」）  
         ・AI提案の場合は **「【AI提案】title」** の形式
       - なぜこのシナリオが適切か、または不適切かの説明（notes）
       - 返信の感情的なトーン（sentiment）：  
         ・「positive」「negative」「neutral」のいずれか
    4. **マニュアルルール**は必ず厳守してください。これらに抵触しないよう注意してください。
    5. 返信メッセージは具体的かつ実用的にし、常に丁寧な顧客対応を心がけてください。
    ---
    
    上記を踏まえて、**必ず複数のシナリオ**を提案してください。
    `;
    
    // OpenAI APIリクエスト
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inquiry },
      ],
      functions: [
        {
          name: "generate_response",
          description: "Generate multiple customer support response scenarios",
          parameters: {
            type: "object",
            properties: {
              scenarios: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    reply: {
                      type: "string",
                      description: "具体的な返信メッセージ"
                    },
                    scenarioType: {
                      type: "string",
                      description: "シナリオの種類（事前定義シナリオのタイトル、または'AI提案'）"
                    },
                    notes: {
                      type: "string",
                      description: "シナリオの選択理由や補足情報"
                    },
                    sentiment: {
                      type: "string",
                      enum: ["positive", "negative", "neutral"],
                      description: "返信の感情的なトーン"
                    }
                  },
                  required: ["reply", "scenarioType", "notes", "sentiment"]
                }
              }
            },
            required: ["scenarios"]
          }
        }
      ],
      function_call: { name: "generate_response" }
    });
    
    // レスポンスの処理
    const message = response.choices[0]?.message;
    
    // モデルが応答を拒否した場合
    if (message?.refusal) {
      console.error('Model refused to respond:', message.refusal);
      return NextResponse.json({
        scenarios: [{
          reply: "申し訳ございません。適切な応答を生成できませんでした。",
          scenarioType: "エラー",
          notes: "応答拒否",
          sentiment: "neutral"
        }]
      }, { status: 422 });
    }
    
    // 応答が不完全な場合
    if (response.choices[0]?.finish_reason === "length") {
      return NextResponse.json({
        scenarios: [{
          reply: "申し訳ございません。応答が不完全です。",
          scenarioType: "エラー",
          notes: "応答不完全",
          sentiment: "neutral"
        }]
      }, { status: 500 });
    }
    
    // コンテンツフィルターによる制限
    if (response.choices[0]?.finish_reason === "content_filter") {
      return NextResponse.json({
        scenarios: [{
          reply: "申し訳ございません。不適切なコンテンツが検出されました。",
          scenarioType: "エラー",
          notes: "コンテンツフィルター",
          sentiment: "neutral"
        }]
      }, { status: 422 });
    }
    
    // function_callの結果を処理
    if (message?.function_call?.arguments) {
      const parsedResponse = JSON.parse(message.function_call.arguments) as AIResponse;
      return NextResponse.json(parsedResponse);
    }
    
    throw new Error('Unexpected response format');
    
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

## 7. フロントエンドの変更

### 7.1 useLocalStorageフックの代わりにuseSupabaseフックを作成

```typescript
// hooks/useSupabase.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useSupabaseManuals() {
  const [manuals, setManuals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setManuals([]);
      setLoading(false);
      return;
    }

    const fetchManuals = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('manuals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setManuals(data || []);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchManuals();

    // リアルタイム更新のサブスクリプション
    const subscription = supabase
      .channel('manuals_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'manuals',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setManuals((prev) => [payload.new, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setManuals((prev) => prev.filter((item) => item.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setManuals((prev) =>
            prev.map((item) => (item.id === payload.new.id ? payload.new : item))
          );
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const addManual = async (content: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.from('manuals').insert({
        user_id: user.id,
        content,
      }).select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error: any) {
      setError(error.message);
      return null;
    }
  };

  const deleteManual = async (id: string) => {
    try {
      const { error } = await supabase
        .from('manuals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  return { manuals, loading, error, addManual, deleteManual };
}

// 同様に、useSupabaseProducts と useSupabaseScenarios も実装
```

### 7.2 各ページコンポーネントの修正

マニュアル管理ページ、商品情報管理ページ、シナリオ管理ページを修正して、LocalStorageの代わりにSupabaseを使用するように変更します。例として、マニュアル管理ページの修正を示します：

```typescript
// app/manual/page.tsx
'use client';

import React, { useState } from 'react';
import { useSupabaseManuals } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ManualPage() {
  const { manuals, loading, error, addManual, deleteManual } = useSupabaseManuals();
  const [content, setContent] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // 認証されていない場合は認証ページにリダイレクト
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;

    await addManual(content);
    setContent('');
  };

  const handleDelete = async (id: string) => {
    await deleteManual(id);
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">マニュアル管理</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 p-4 border rounded-lg resize-none"
          placeholder="マニュアル内容を入力してください（例：返品ポリシー、保証内容、対応方針など）"
        />
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          保存
        </button>
      </form>
      <div className="space-y-4">
        {loading ? (
          <div>Loading...</div>
        ) : (
          manuals.map((manual) => (
            <div key={manual.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(manual.created_at).toLocaleString('ja-JP')}
                </span>
                <button
                  onClick={() => handleDelete(manual.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-gray-700">{manual.content}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

## 8. 実装スケジュール

### フェーズ1: 準備と環境設定（1週目）

1. Supabaseプロジェクトのセットアップ
2. 必要なパッケージのインストール
3. 環境変数の設定
4. Supabaseクライアントの設定

### フェーズ2: 認証機能の実装（2週目）

1. 認証コンポーネントの作成（ログイン、新規登録、ログアウト）
2. 認証コンテキストの実装
3. 認証ページの作成
4. 認証ミドルウェアの実装

### フェーズ3: データベース設計と実装（3週目）

1. テーブル設計（マニュアル、商品情報、シナリオ）
2. RLSポリシーの設定
3. インデックスの設定
4. データベースのテスト

### フェーズ4: データ移行機能の実装（4週目）

1. データ移行ユーティリティの作成
2. データ移行ページの実装
3. 移行テスト

### フェーズ5: APIエンドポイントの保護（5週目）

1. 認証チェック関数の作成
2. APIエンドポイントの修正
3. APIテスト

### フェーズ6: フロントエンドの変更（6週目）

1. useSupabaseフックの実装
2. 各ページコンポーネントの修正
3. UIテスト

### フェーズ7: テストと最終調整（7週目）

1. 統合テスト
2. パフォーマンステスト
3. バグ修正
4. ドキュメント作成

### フェーズ8: デプロイ（8週目）

1. 本番環境の準備
2. デプロイ
3. 監視設定
4. ユーザートレーニング

## 9. まとめ

この実装計画では、現在のLocalStorageベースのデータ管理からSupabaseを使用した認証とデータ管理への移行を詳細に説明しました。主な変更点は以下の通りです：

1. **ユーザー認証の追加**
   - ユーザー登録・ログイン機能
   - 認証状態の管理
   - 認証ミドルウェアによるページ保護

2. **データ管理のSupabaseへの移行**
   - テーブル設計とRLSポリシー
   - LocalStorageからのデータ移行
   - リアルタイムデータ同期

3. **APIエンドポイントの保護**
   - 認証チェック関数
   - APIエンドポイントの修正

4. **フロントエンドの変更**
   - useLocalStorageフックからuseSupabaseフックへの移行
   - 各ページコンポーネントの修正

これらの変更により、アプリケーションのセキュリティが向上し、複数デバイス間でのデータ同期が可能になります。また、将来的な機能拡張（チーム機能、共有機能など）も容易になります。