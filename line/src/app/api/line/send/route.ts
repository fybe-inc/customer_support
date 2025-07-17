import { NextRequest, NextResponse } from 'next/server';
import { channelAccessToken } from '@/lib/line/client';
import { tables } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

/**
 * LINE Messaging APIでメッセージを送信
 */
async function sendLineMessage(userId: string, message: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${channelAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: 'text',
            text: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('LINE API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text(),
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending LINE message:', error);
    return false;
  }
}

/**
 * POST /api/line/send
 * UIからメッセージを送信するAPIエンドポイント
 */
export async function POST(request: NextRequest) {
  try {
    const { chatId, message } = await request.json();

    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'chatId and message are required' },
        { status: 400 }
      );
    }

    // データベースからチャット情報を取得
    const supabase = await createClient();
    const { lineChats, lineMessages } = tables(supabase);
    
    const chat = await lineChats.findById(chatId);
    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // LINE APIでメッセージを送信
    const success = await sendLineMessage(chat.line_user_id, message);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send message to LINE' },
        { status: 500 }
      );
    }

    // データベースに送信メッセージを保存
    const savedMessage = await lineMessages.saveReply(
      chatId,
      `reply_${Date.now()}`,
      message
    );

    if (!savedMessage) {
      console.error('Failed to save message to database');
      // メッセージ送信は成功したが、DB保存に失敗
      return NextResponse.json(
        { error: 'Message sent but failed to save to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: savedMessage,
    });
  } catch (error) {
    console.error('Error in POST /api/line/send:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/line/send
 * APIの状態確認用
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'LINE Send API is running',
  });
}