export interface AIScenario {
  reply: string;
  scenarioType: string;
  notes: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface AIResponse {
  scenarios: AIScenario[];
}

export interface ScenarioEntry {
  id: string;
  description: string;
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
  timestamp: number;
}

export interface ProductEntry {
  id: string;
  content: string;
  timestamp: number;
}

export interface Scenario {
  id: string;
  prompt: string;
  description: string;
}

export interface ScenarioState {
  scenarios: Scenario[];
}
