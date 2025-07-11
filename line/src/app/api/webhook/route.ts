import { NextRequest, NextResponse } from 'next/server';
import { LineWebhookRequest, LineWebhookEvent, StoredMessage } from '@/types/line';
import { LineClient } from '@/lib/lineClient';

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const channelSecret = process.env.LINE_CHANNEL_SECRET!;

const messages: StoredMessage[] = [];

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-line-signature');
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const bodyText = await req.text();
    
    // 空のボディの場合は200を返す（LINE Webhook URL検証用）
    if (!bodyText) {
      return new NextResponse('OK', { status: 200 });
    }

    const lineClient = new LineClient(channelAccessToken);

    if (channelSecret && !(await lineClient.verifySignature(bodyText, signature, channelSecret))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const body: LineWebhookRequest = JSON.parse(bodyText);
    
    // イベントがない場合も200を返す
    if (!body.events || body.events.length === 0) {
      return new NextResponse('OK', { status: 200 });
    }
    
    for (const event of body.events) {
      if (event.type === 'message' && event.message?.type === 'text') {
        await handleTextMessage(event, lineClient);
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    // エラーが発生しても200を返す（LINEの仕様）
    return new NextResponse('OK', { status: 200 });
  }
}

async function handleTextMessage(event: LineWebhookEvent, lineClient: LineClient) {
  if (!event.source.userId || !event.message?.text) return;

  try {
    const userProfile = await lineClient.getUserProfile(event.source.userId);
    
    const userMessage: StoredMessage = {
      id: `${Date.now()}-user`,
      userId: event.source.userId,
      userName: userProfile.displayName,
      message: event.message.text,
      timestamp: new Date(event.timestamp),
      isFromUser: true,
      replyToken: event.replyToken,
    };
    
    messages.push(userMessage);

    const autoReply = `メッセージを受信しました: "${event.message.text}"\n\nこちらは自動返信です。`;
    
    if (event.replyToken) {
      await lineClient.replyMessage(event.replyToken, [{
        type: 'text',
        text: autoReply,
      }]);

      const botMessage: StoredMessage = {
        id: `${Date.now()}-bot`,
        userId: event.source.userId,
        userName: userProfile.displayName,
        message: autoReply,
        timestamp: new Date(),
        isFromUser: false,
      };
      
      messages.push(botMessage);
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

export async function GET() {
  return NextResponse.json({ messages });
}