# カスタマーサポートアプリケーション データフロー図

## 1. 全体アーキテクチャ

```mermaid
flowchart TB
    subgraph Frontend["フロントエンド (Next.js)"]
        HomePage["ホームページ (/)"]
        ManualPage["マニュアル管理 (/manual)"]
        ProductsPage["商品情報管理 (/products)"]
        ScenariosPage["シナリオ管理 (/scenarios)"]
        
        LocalStorage[("ローカルストレージ")]
        
        ManualPage -->|保存| LocalStorage
        ProductsPage -->|保存| LocalStorage
        ScenariosPage -->|保存| LocalStorage
        
        HomePage -->|読み込み| LocalStorage
    end
    
    subgraph Backend["バックエンド (Next.js API Routes)"]
        APIEndpoint["API エンドポイント (/api/getResponse)"]
    end
    
    subgraph ExternalAPI["外部API"]
        OpenAI["OpenAI API"]
    end
    
    HomePage -->|問い合わせ送信| APIEndpoint
    APIEndpoint -->|リクエスト| OpenAI
    OpenAI -->|レスポンス| APIEndpoint
    APIEndpoint -->|シナリオ返却| HomePage
```

## 2. 問い合わせ処理フロー

```mermaid
sequenceDiagram
    actor User as オペレーター
    participant HomePage as ホームページ
    participant LocalStorage as ローカルストレージ
    participant APIEndpoint as APIエンドポイント
    participant OpenAI as OpenAI API
    
    User->>HomePage: 問い合わせ内容を入力
    HomePage->>LocalStorage: マニュアル、商品情報、シナリオを取得
    LocalStorage-->>HomePage: データ返却
    
    HomePage->>APIEndpoint: 問い合わせ内容とデータを送信
    APIEndpoint->>OpenAI: システムプロンプトとユーザープロンプトを送信
    OpenAI-->>APIEndpoint: 複数のシナリオを返却
    APIEndpoint-->>HomePage: シナリオをJSON形式で返却
    
    HomePage-->>User: シナリオを表示
    User->>HomePage: シナリオを選択・編集
```

## 3. コンポーネント関係図

```mermaid
flowchart TB
    subgraph Layout["レイアウト構造"]
        RootLayout["RootLayout (layout.tsx)"]
        Navbar["Navbar.tsx"]
        
        RootLayout -->|包含| Navbar
    end
    
    subgraph Pages["ページコンポーネント"]
        HomePage["HomePage (page.tsx)"]
        ManualPage["ManualPage (manual/page.tsx)"]
        ProductsPage["ProductsPage (products/page.tsx)"]
        ScenariosPage["ScenariosPage (scenarios/page.tsx)"]
    end
    
    subgraph Components["機能コンポーネント"]
        InquiryForm["InquiryForm.tsx"]
        AIResponseDisplay["AIResponseDisplay.tsx"]
        ScenarioManagement["ScenarioManagement.tsx"]
        AIScenarioSelector["AIScenarioSelector.tsx"]
    end
    
    subgraph Hooks["カスタムフック"]
        useLocalStorage["useLocalStorage.ts"]
    end
    
    RootLayout -->|包含| Pages
    
    HomePage -->|使用| InquiryForm
    HomePage -->|使用| AIResponseDisplay
    HomePage -->|使用| useLocalStorage
    
    ManualPage -->|使用| useLocalStorage
    ProductsPage -->|使用| useLocalStorage
    ScenariosPage -->|使用| useLocalStorage
    
    ScenariosPage -->|使用| ScenarioManagement
```

## 4. データモデル関係図

```mermaid
classDiagram
    class AIScenario {
        +string reply
        +string scenarioType
        +string notes
        +string sentiment
    }
    
    class AIResponse {
        +AIScenario[] scenarios
    }
    
    class ManualEntry {
        +string id
        +string content
        +number timestamp
    }
    
    class ProductEntry {
        +string id
        +string content
        +number timestamp
    }
    
    class Scenario {
        +string id
        +string title
        +string prompt
    }
    
    class InquiryRequest {
        +string inquiry
        +ManualEntry[] manuals
        +ProductEntry[] products
        +Scenario[] scenarios
    }
    
    AIResponse "1" *-- "many" AIScenario
    InquiryRequest "1" *-- "many" ManualEntry
    InquiryRequest "1" *-- "many" ProductEntry
    InquiryRequest "1" *-- "many" Scenario
```

## 5. ページナビゲーション図

```mermaid
graph LR
    HomePage["ホームページ (/)"]
    ManualPage["マニュアル管理 (/manual)"]
    ProductsPage["商品情報管理 (/products)"]
    ScenariosPage["シナリオ管理 (/scenarios)"]
    
    HomePage -- "ナビゲーションバー" --> ManualPage
    HomePage -- "ナビゲーションバー" --> ProductsPage
    HomePage -- "ナビゲーションバー" --> ScenariosPage
    
    ManualPage -- "ナビゲーションバー" --> HomePage
    ManualPage -- "ナビゲーションバー" --> ProductsPage
    ManualPage -- "ナビゲーションバー" --> ScenariosPage
    
    ProductsPage -- "ナビゲーションバー" --> HomePage
    ProductsPage -- "ナビゲーションバー" --> ManualPage
    ProductsPage -- "ナビゲーションバー" --> ScenariosPage
    
    ScenariosPage -- "ナビゲーションバー" --> HomePage
    ScenariosPage -- "ナビゲーションバー" --> ManualPage
    ScenariosPage -- "ナビゲーションバー" --> ProductsPage