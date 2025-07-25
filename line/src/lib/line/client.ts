// LINE API用の型をここで定義
export type LineApiMessage = {
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker' | 'template' | 'flex';
  text?: string;
  originalContentUrl?: string;
  previewImageUrl?: string;
};

export type LineReplyRequest = {
  replyToken: string;
  messages: LineApiMessage[];
};

export type LinePushRequest = {
  to: string;
  messages: LineApiMessage[];
};

export const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
if (!channelAccessToken) {
  throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set');
}

export class LineClient {
  private channelAccessToken: string;
  private baseUrl = 'https://api.line.me/v2/bot';

  constructor(channelAccessToken: string) {
    this.channelAccessToken = channelAccessToken;
  }

  async replyMessage(replyToken: string, messages: LineApiMessage[]): Promise<void> {
    const body: LineReplyRequest = {
      replyToken,
      messages,
    };

    const response = await fetch(`${this.baseUrl}/message/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.channelAccessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LINE API error: ${JSON.stringify(error)}`);
    }
  }

  async pushMessage(to: string, messages: LineApiMessage[]): Promise<void> {
    const body: LinePushRequest = {
      to,
      messages,
    };

    const response = await fetch(`${this.baseUrl}/message/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.channelAccessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LINE API error: ${JSON.stringify(error)}`);
    }
  }

  async getUserProfile(userId: string): Promise<{ displayName: string; pictureUrl?: string }> {
    const response = await fetch(`${this.baseUrl}/profile/${userId}`, {
      headers: {
        'Authorization': `Bearer ${this.channelAccessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LINE API error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  async verifySignature(body: string, signature: string, channelSecret: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(channelSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(body)
    );
    
    const hash = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
    return hash === signature;
  }
}