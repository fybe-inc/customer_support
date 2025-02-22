export interface AIResponse {
  reply: string;
  scenarioType: string;
  notes: string;
}

export interface InquiryRequest {
  inquiry: string;
}

export interface ManualEntry {
  id: string;
  content: string;
  timestamp: number;
}

export interface ProductEntry {
  id: string;
  content: string;
  timestamp: number;
}

export interface ScenarioEntry {
  id: string;
  title: string;
  prompt: string;
  timestamp: number;
}

export const DEFAULT_SCENARIOS: ScenarioEntry[] = [
  {
    id: 'positive-response',
    title: '肯定的な返事',
    prompt: 'ユーザーからの問い合わせに対して、共感的で前向きな態度で返信してください。ユーザーの要望に可能な限り応えられるよう努め、誠実で丁寧な対応を心がけてください。\n\n例：\n「ご要望承知いたしました。早速対応させていただきます。」\n「ご不便をおかけし申し訳ございません。直ちに改善させていただきます。」',
    timestamp: 1708595962000
  },
  {
    id: 'negative-response',
    title: '否定的な返事',
    prompt: 'ユーザーからの要望にお応えできない場合でも、丁寧に説明し、可能な代替案を提示するよう心がけてください。\n\n例：\n「申し訳ございませんが、ご要望の対応は現在承ることができません。その代わりに、以下の方法をご提案させていただきます。」\n「誠に恐れ入りますが、ご要望の件につきましては、システムの仕様上対応が難しい状況でございます。」',
    timestamp: 1708595962000
  },
  {
    id: 'waiting-response',
    title: '返信待ち',
    prompt: '詳細な確認や社内での検討が必要な場合に使用します。具体的な返信予定時期を明示し、ユーザーの不安を軽減するよう心がけてください。\n\n例：\n「ご連絡ありがとうございます。確認に少々お時間をいただきたく、3営業日以内に改めてご連絡させていただきます。」\n「申し訳ございませんが、担当部署に確認が必要なため、今しばらくお待ちいただけますでしょうか。必ず3営業日以内にご返信させていただきます。」',
    timestamp: 1708595962000
  }
];
