import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

// ランダムなパスワードを生成する関数
function generateRandomPassword(length = 12) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// デフォルトデータを挿入する関数
async function insertDefaultData(userId: string) {
  try {
    // デフォルトマニュアルデータの挿入
    await supabaseAdmin.from("manuals").insert([
      {
        user_id: userId,
        content:
          "署名として,合同会社FYBE.jp カスタマーサポート担当：内藤剛汰をメッセージの末尾に追加してください。",
      },
      {
        user_id: userId,
        content: "ユーザーへカジュアルに答えてください。",
      },
    ]);

    // デフォルト商品データの挿入
    await supabaseAdmin.from("products").insert([
      {
        user_id: userId,
        content: JSON.stringify({
          商品名: "Anker PowerCore Essential 20000",
          価格: "¥4,990（税込）",
          在庫状況: "在庫あり",
          商品説明:
            "20000mAhの超大容量で、iPhone 15を約3回以上、Galaxy S22を約3回、iPad mini 5を2回以上満充電可能。Anker独自技術PowerIQとVoltageBoostにより、最適なスピードで充電が可能です（低電流モード搭載で小型機器にも対応）。2つのUSB出力ポート搭載で2台同時に充電可能。USB-CとMicro USBの両入力ポートを備え、状況に応じて充電可能。多重保護システム採用で長期間安心して使用できます。",
          "主要な仕様・特徴": [
            "超大容量（20,000mAh）でスマホを約3回以上充電可能",
            "PowerIQ搭載で最適な高速充電（※Quick Charge非対応）",
            "USB出力ポート2つ搭載で2台同時充電対応（合計15W）",
            "USB-C/Micro USBの2入力方式に対応",
            "低電流モード搭載（小型電子機器に最適）",
          ],
          カテゴリー情報: "モバイルバッテリー",
          "ユーザーレビュー（概要）": "平均4.5／5 （18件のレビュー）",
          商品ページURL: "https://www.ankerjapan.com/products/a1268",
        }),
      },
      {
        user_id: userId,
        content: JSON.stringify({
          商品名: "Anker 622 Magnetic Battery (MagGo)",
          価格: "¥6,990（税込）",
          在庫状況: "在庫なし",
          商品説明:
            "MagSafe対応のワイヤレスバッテリー。5000mAhの容量でiPhoneへのワイヤレス充電に対応。折りたたみ式スタンド機能付きで動画視聴などに便利。マグネットでiPhone背面に吸着し、一体化して充電可能。安全性にも配慮した多重保護機能搭載。",
          "主要な仕様・特徴": [
            "MagSafe対応の5000mAhワイヤレスバッテリー",
            "折りたたみスタンド搭載でハンズフリー利用",
            "マグネットでiPhoneにしっかり吸着",
            "最大7.5Wのワイヤレス充電に対応",
            "多重保護機能搭載で安全に充電",
          ],
          カテゴリー情報: "モバイルバッテリー",
          "ユーザーレビュー（概要）": "平均4.3／5 （56件のレビュー）",
          商品ページURL: "https://www.ankerjapan.com/products/a1611",
        }),
      },
    ]);

    // デフォルトシナリオデータの挿入
    await supabaseAdmin.from("scenarios").insert([
      {
        user_id: userId,
        title: "肯定的な回答",
        prompt:
          "返信は肯定的で協力的な態度で作成してください。顧客の要望に対して可能な限り対応する姿勢を示し、前向きな表現を使用してください。",
      },
      {
        user_id: userId,
        title: "否定的な回答",
        prompt:
          "返信は申し訳ない気持ちを示しながら、要望にお応えできない理由を丁寧に説明してください。代替案がある場合は提案してください。",
      },
      {
        user_id: userId,
        title: "遅延を伝える",
        prompt:
          "3営業日以内に返信することを適切に伝えてください。可能な限り対応する姿勢を示し、前向きな表現を使用してください。",
      },
    ]);

    return { success: true };
  } catch (error) {
    console.error("デフォルトデータ挿入エラー:", error);
    return { success: false, error };
  }
}

export async function GET(request: NextRequest) {
  try {
    // URLからクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // メールアドレスが提供されていない場合はエラーを返す
    if (!email) {
      return NextResponse.json(
        { error: "メールアドレスが必要です" },
        { status: 400 },
      );
    }

    // ランダムなパスワードを生成
    const password = generateRandomPassword();

    // Supabaseを使用してユーザーを作成
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // メール確認を自動的に完了
    });

    // エラーが発生した場合
    if (error) {
      console.error("ユーザー作成エラー:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // デフォルトデータを挿入
    const { success, error: dataError } = await insertDefaultData(user.user.id);

    if (!success) {
      console.error("デフォルトデータ挿入エラー:", dataError);
      // ユーザーは作成されているので、エラーは返さずに続行
    }

    // 成功した場合、ユーザー情報とパスワードを返す
    return NextResponse.json({
      message: "ユーザーが正常に作成されました",
      user: {
        ...user,
        password, // パスワードを含める
      },
    });
  } catch (error) {
    console.error("予期しないエラー:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 },
    );
  }
}
