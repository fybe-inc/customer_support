# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Customer Support System - AIアシスト型のカスタマーサポートプラットフォーム。カスタマーサポート担当者がお客様からの問い合わせに対して、AIが生成した複数の回答案から最適なものを選び、編集して送信できるシステム。

## Package Manager

**重要**: このプロジェクトでは **Bun** をパッケージマネージャーとして使用しています。

```bash
# 依存関係のインストール
cd frontend && bun install

# 開発サーバーの起動（ユーザーが手動で実行）
cd frontend && bun run dev

# ビルド
cd frontend && bun run build

# リント
cd frontend && bun run lint

# 型チェック
cd frontend && bun run typecheck

# コードフォーマット
cd frontend && bun run format
```

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15.3.1 (App Router), React 19.1.0, TypeScript 5.8.3, Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL, Auth, Realtime)
- **AI Integration**: OpenRouter API (Google Gemini 2.0 Flash)

### Project Structure
```
customer_support/
├── frontend/          # Next.jsアプリケーション
│   ├── src/
│   │   ├── app/      # App Router pages and API routes
│   │   ├── components/
│   │   ├── hooks/    # Custom React hooks
│   │   ├── lib/      # Core business logic
│   │   ├── types/    # TypeScript type definitions
│   │   └── utils/    # Utility functions (Supabase client)
├── supabase/         # Database migrations and config
└── roo/              # Documentation
```

### Key Components

1. **API Routes** (`src/app/api/`)
   - `getResponse/` - AI response generation endpoint
   - `healthcheck/` - Health check endpoint

2. **Core Libraries** (`src/lib/`)
   - `database.ts` - Supabase database operations
   - `openrouter.ts` - OpenRouter API integration
   - `localStorage.ts` - Local storage management

3. **Main Pages** (`src/app/`)
   - `/` - Main customer support interface
   - `/auth/` - Authentication pages
   - `/manual/` - Manual management
   - `/products/` - Product information management
   - `/scenarios/` - Scenario templates
   - `/precedents/` - Past response examples

## Database Schema

All tables use Row Level Security (RLS) and are multi-tenant:

- `user_experiences` - Customer interaction data
- `manuals` - Company policies and rules
- `products` - Product information
- `scenarios` - Response templates
- `precedents` - Past response examples

## Development Workflow

### Environment Setup
1. Copy `.env.local.example` to `.env.local`
2. Configure Supabase credentials and OpenRouter API key
3. Run `cd frontend && bun install`

### Common Tasks

```bash
# Supabase local development
supabase start
supabase db reset  # Reset local database

# Database migrations
supabase migration new <migration_name>
supabase db push  # Apply migrations
```

### API Integration

- **OpenRouter API**: Used for AI response generation via Google Gemini 2.0 Flash
- **Supabase**: Handles authentication, database operations, and real-time updates

### Important Notes

1. **Authentication**: All API routes require Supabase authentication
2. **Multi-tenancy**: Data is isolated per user using RLS policies
3. **Local Storage**: Integrated with Supabase for offline capability
4. **Response Generation**: Creates multiple response variants (positive, negative, neutral)

## Current Development Status

- Supabase認証システムへの移行が完了
- ローカルストレージとSupabaseの同期機能実装済み
- 現在のブランチ: `konaito/frontend/fix-data-acquisition-method`