import { ManualEntry, ProductEntry, Scenario } from "@/types/types";

// デフォルトのマニュアルデータ
export const defaultManuals: ManualEntry[] = [
  {
    id: "default-manual-1",
    content:
      "署名として,合同会社FYBE.jp カスタマーサポート担当：内藤剛汰をメッセージの末尾に追加してください。",
  },
  {
    id: "default-manual-2",
    content: "ユーザーへカジュアルに答えてください。",
  },
];

// デフォルトの商品データ
export const defaultProducts: ProductEntry[] = [
  {
    id: "default-product-1",
    content: `{
  "商品名": "Anker PowerCore Essential 20000",
  "価格": "¥4,990（税込）",
  "在庫状況": "在庫あり",
  "商品説明": "20000mAhの超大容量で、iPhone 15を約3回以上、Galaxy S22を約3回、iPad mini 5を2回以上満充電可能。Anker独自技術PowerIQとVoltageBoostにより、最適なスピードで充電が可能です（低電流モード搭載で小型機器にも対応）。2つのUSB出力ポート搭載で2台同時に充電可能。USB-CとMicro USBの両入力ポートを備え、状況に応じて充電可能。多重保護システム採用で長期間安心して使用できます。",
  "主要な仕様・特徴": [
    "超大容量（20,000mAh）でスマホを約3回以上充電可能",
    "PowerIQ搭載で最適な高速充電（※Quick Charge非対応）",
    "USB出力ポート2つ搭載で2台同時充電対応（合計15W）",
    "USB-C/Micro USBの2入力方式に対応",
    "低電流モード搭載（小型電子機器に最適）"
  ],
  "カテゴリー情報": "モバイルバッテリー",
  "ユーザーレビュー（概要）": "平均4.5／5 （18件のレビュー）",
  "商品ページURL": "https://www.ankerjapan.com/products/a1268"
}
`,
  },
  {
    id: "default-product-2",
    content: `{
  "商品名": "Anker 622 Magnetic Battery (MagGo)",
  "価格": "¥6,990（税込）",
  "在庫状況": "在庫なし",
  "商品説明": "MagSafe対応のワイヤレスバッテリー。5000mAhの容量でiPhoneへのワイヤレス充電に対応。折りたたみ式スタンド機能付きで動画視聴などに便利。マグネットでiPhone背面に吸着し、一体化して充電可能。安全性にも配慮した多重保護機能搭載。",
  "主要な仕様・特徴": [
    "MagSafe対応の5000mAhワイヤレスバッテリー",
    "折りたたみスタンド搭載でハンズフリー利用",
    "マグネットでiPhoneにしっかり吸着",
    "最大7.5Wのワイヤレス充電に対応",
    "多重保護機能搭載で安全に充電"
  ],
  "カテゴリー情報": "モバイルバッテリー",
  "ユーザーレビュー（概要）": "平均4.3／5 （56件のレビュー）",
  "商品ページURL": "https://www.ankerjapan.com/products/a1611"
}
`,
  },
];

// デフォルトのシナリオデータ
export const defaultScenarios: Scenario[] = [
  {
    id: "default-scenario-1",
    title: "肯定的な回答",
    prompt:
      "返信は肯定的で協力的な態度で作成してください。顧客の要望に対して可能な限り対応する姿勢を示し、前向きな表現を使用してください。",
  },
  {
    id: "default-scenario-2",
    title: "肯定的な回答",
    prompt:
      "返信は申し訳ない気持ちを示しながら、要望にお応えできない理由を丁寧に説明してください。代替案がある場合は提案してください。",
  },
  {
    id: "default-scenario-3",
    title: "遅延を伝える",
    prompt:
      "3営業日以内に返信することを適切に伝えてください。可能な限り対応する姿勢を示し、前向きな表現を使用してください。",
  },
];

// すべてのデフォルト設定をまとめたオブジェクト
export const defaultSettings = {
  manuals: defaultManuals,
  products: defaultProducts,
  scenarios: defaultScenarios,
};

// LocalStorageのキー
export const STORAGE_KEYS = {
  MANUALS: "manuals",
  PRODUCTS: "products",
  SCENARIOS: "scenarios",
  INITIALIZED: "initialized",
};
