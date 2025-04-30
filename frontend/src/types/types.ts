export interface AIScenario {
  reply: string;
  scenarioType: string;
  notes: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface AIResponse {
  scenarios: AIScenario[];
}

export interface ScenarioEntry {
  id: string;
  title: string;
  prompt: string;
}

export interface InquiryRequest {
  inquiry: string;
  manuals: Array<{ content: string }>;
  products: Array<{ content: string }>;
  scenarios: Array<{ title: string; prompt: string }>;
}

export interface ManualEntry {
  id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductEntry {
  id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface Scenario {
  id: string;
  title: string; // descriptionからtitleに変更
  prompt: string;
}

export interface ScenarioState {
  scenarios: Scenario[];
}
