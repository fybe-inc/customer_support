import { NextRequest, NextResponse } from 'next/server';
import { getLineUserProfile } from '@/lib/line/profile';

/**
 * GET /api/line/profile?userId=xxx
 * プロフィール取得のテスト用エンドポイント
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    console.log('Testing profile retrieval for user:', userId);
    
    const profile = await getLineUserProfile(userId);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to retrieve profile' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error in profile test endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}