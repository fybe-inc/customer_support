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
