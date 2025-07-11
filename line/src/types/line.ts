export interface LineWebhookEvent {
  type: 'message' | 'follow' | 'unfollow' | 'join' | 'leave' | 'postback' | 'beacon';
  replyToken?: string;
  mode: 'active' | 'standby';
  timestamp: number;
  source: {
    type: 'user' | 'group' | 'room';
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  message?: {
    id: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker';
    text?: string;
    fileName?: string;
    fileSize?: number;
    title?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    packageId?: string;
    stickerId?: string;
    stickerResourceType?: string;
  };
}

export interface LineWebhookRequest {
  destination: string;
  events: LineWebhookEvent[];
}

export interface LineMessage {
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker' | 'template' | 'flex';
  text?: string;
  originalContentUrl?: string;
  previewImageUrl?: string;
}

export interface LineReplyRequest {
  replyToken: string;
  messages: LineMessage[];
}

export interface LinePushRequest {
  to: string;
  messages: LineMessage[];
}

export interface StoredMessage {
  id: string;
  userId: string;
  userName?: string;
  message: string;
  timestamp: Date;
  isFromUser: boolean;
  replyToken?: string;
}