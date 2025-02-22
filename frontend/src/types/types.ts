export interface AIResponse {
  reply: string;
  scenarioType: string;
  notes: string;
}

export interface InquiryRequest {
  inquiry: string;
  scenario?: Scenario;
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
