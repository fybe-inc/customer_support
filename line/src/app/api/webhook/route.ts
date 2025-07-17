import { NextRequest, NextResponse } from 'next/server';
import { tables } from '@/lib/db';
import { createServiceClient } from '@/lib/supabase/service';
import { getLineUserProfile } from '@/lib/line/profile';

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const { lineWebhookEvents, lineChats, lineMessages, lineProfiles } = tables(supabase);
  try {
    const body = await req.text();
    console.log('Webhook received:', body);
    
    const data = JSON.parse(body);
    
    for (const event of data.events || []) {
      console.log('Processing event:', event.type, event.message?.type);
      
      // Webhookイベントを保存
      await lineWebhookEvents.save(event);
      
      if (event.type === 'message' && event.message?.type === 'text') {
        console.log('Processing message:', event.message.text);
        
        // プロフィール情報を取得
        console.log('Attempting to get profile for user:', event.source.userId);
        const profile = await getLineUserProfile(event.source.userId);
        console.log('Profile result:', profile);
        
        // プロフィールを upsert（存在しなければ作成、存在すれば更新）
        let profileRecord = null;
        if (profile) {
          profileRecord = await lineProfiles.upsert({
            lineUserId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            statusMessage: profile.statusMessage,
            language: profile.language,
          });
          console.log('Profile upserted:', profileRecord ? 'success' : 'failed');
        }
        
        // チャットを取得/作成
        const chat = await lineChats.getOrCreate(event.source.userId);
        console.log('Chat created/updated:', chat ? 'success' : 'failed');
        
        // チャットにプロフィールを関連付け
        if (chat && profileRecord) {
          // profile_idを更新（新しいリレーショナル構造）
          const { error } = await supabase
            .from('line_chats')
            .update({ profile_id: profileRecord.id })
            .eq('id', chat.id);
          
          if (error) {
            console.error('Error linking profile to chat:', error);
          } else {
            console.log('Profile linked to chat successfully');
          }
        }
        
        if (chat) {
          // 受信メッセージを保存
          await lineMessages.save(chat.id, event);
        }
        
        // 自動返信は無効化（UIから手動で返信する）
        // await replyMessage(event.replyToken, event.message.text);
      }
    }
    
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('OK', { status: 200 });
  }
}



export async function GET() {
  return NextResponse.json({ status: 'OK' });
}