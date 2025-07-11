# LINE Webhook カスタマーサポートアプリ

LINE公式アカウントのWebhookを使用したカスタマーサポートアプリケーションです。LINE公式UIとは異なり、トーク返答に特化したインターフェースを提供します。

## 機能

- LINE公式アカウントへのメッセージをWebhook経由で受信
- 複数の会話を管理できる会話リスト
- リアルタイムでのメッセージ送受信
- トーク返答に特化したUI

## セットアップ

### 環境変数

`.env.local`ファイルに以下の環境変数を設定してください：

```
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret
```

### インストール

```bash
bun install
```

### 開発サーバーの起動

```bash
bun run dev
```

### ビルド

```bash
bun run build
```

## LINE Developers設定

1. LINE Developersコンソールで新しいMessaging APIチャネルを作成
2. Webhook URLを設定：`https://your-domain.com/api/webhook`
3. Webhook利用を有効化
4. チャネルアクセストークンとチャネルシークレットを取得し、環境変数に設定

## API エンドポイント

- `POST /api/webhook` - LINE Webhookイベントを受信
- `GET /api/webhook` - 保存されたメッセージを取得
- `POST /api/line/send` - LINEユーザーにメッセージを送信

## 技術スタック

- Next.js 15.3.5
- TypeScript
- Tailwind CSS
- LINE Messaging API
- Lucide React (アイコン)
