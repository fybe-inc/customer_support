# Supabase認証システム移行計画

## 概要

このディレクトリには、現在のSupabase認証システムから新しいsupabase-frameベースの実装への移行計画が含まれています。supabase-frameは、Next.jsアプリケーションにおけるSupabaseの認証とセッション管理のためのより堅牢なフレームワークを提供します。

## 背景

現在のプロジェクトでは、`@supabase/auth-helpers-nextjs`を使用してSupabaseの認証を実装していますが、supabase-frameでは`@supabase/ssr`パッケージを使用した最新のアプローチが採用されています。この移行により、以下のメリットが期待できます：

- より堅牢なセッション管理
- クライアント/サーバー間の一貫したSupabase操作
- 最新のSupabase SDKの機能活用
- コードの保守性と拡張性の向上

## ディレクトリ構成

- `migration-analysis.md` - 現在の実装とsupabase-frameの実装の違いの分析
- `migration-steps.md` - 詳細な移行ステップ
- `migration-timeline.md` - 移行のタイムライン
- `migration-risks.md` - 移行に伴うリスクと対策

## 移行の主な目標

1. `@supabase/auth-helpers-nextjs`から`@supabase/ssr`への移行
2. クライアント/サーバー用のSupabaseクライアント実装の分離
3. ミドルウェアの更新
4. 認証関連コンポーネントの更新
5. APIルートの更新
6. データフックの更新

## 移行後の期待される成果

- より安定した認証システム
- セッション管理の改善
- コードの可読性と保守性の向上
- 将来のSupabase機能拡張への対応力強化