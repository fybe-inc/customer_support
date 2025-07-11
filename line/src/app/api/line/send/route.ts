import { NextRequest, NextResponse } from 'next/server';
import { LineClient } from '@/lib/lineClient';
import { StoredMessage } from '@/types/line';

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN!;

export async function POST(req: NextRequest) {
  try {
    const { userId, message } = await req.json();

    if (!userId || !message) {
      return NextResponse.json({ error: 'userId and message are required' }, { status: 400 });
    }

    const lineClient = new LineClient(channelAccessToken);
    
    await lineClient.pushMessage(userId, [{
      type: 'text',
      text: message,
    }]);

    const storedMessage: StoredMessage = {
      id: `${Date.now()}-admin`,
      userId: userId,
      message: message,
      timestamp: new Date(),
      isFromUser: false,
    };

    return NextResponse.json({ success: true, message: storedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}