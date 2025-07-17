import { channelAccessToken } from "./client";

/**
 * LINE Profile API関連のユーティリティ関数
 */

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  language?: string;
}

interface LineProfileApiResponse {
  displayName: string;
  userId: string;
  pictureUrl?: string;
  statusMessage?: string;
  language?: string;
}

/**
 * LINE Profile APIからユーザーのプロフィール情報を取得
 * @param userId LINE User ID
 * @returns プロフィール情報 または null（エラー時）
 */
export async function getLineUserProfile(userId: string): Promise<LineProfile | null> {
  try {
    console.log('Fetching profile for user:', userId);
    console.log('Channel access token exists:', !!channelAccessToken);
    
    if (!channelAccessToken) {
      console.error('LINE_CHANNEL_ACCESS_TOKEN is not set');
      return null;
    }

    const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${channelAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Profile API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Profile API error response:', errorText);
      
      if (response.status === 403) {
        console.error('User blocked the bot or not added as friend');
      } else if (response.status === 404) {
        console.error('Invalid user ID');
      } else if (response.status === 429) {
        console.error('Rate limit exceeded');
      } else {
        console.error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return null;
    }

    const profileData: LineProfileApiResponse = await response.json();
    console.log('Profile data received:', profileData);
    
    return {
      userId: profileData.userId,
      displayName: profileData.displayName,
      pictureUrl: profileData.pictureUrl,
      statusMessage: profileData.statusMessage,
      language: profileData.language,
    };
  } catch (error) {
    console.error('Error fetching LINE user profile:', error);
    return null;
  }
}

/**
 * プロフィール情報を安全に取得（エラーハンドリング付き）
 * @param userId LINE User ID
 * @param retryCount リトライ回数（デフォルト: 3）
 * @returns プロフィール情報 または null
 */
export async function getLineUserProfileWithRetry(
  userId: string,
  retryCount: number = 3
): Promise<LineProfile | null> {
  for (let i = 0; i < retryCount; i++) {
    const profile = await getLineUserProfile(userId);
    
    if (profile) {
      return profile;
    }
    
    // 429エラー（レート制限）の場合は少し待ってリトライ
    if (i < retryCount - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  return null;
}

/**
 * プロフィール情報が最新かどうかをチェック
 * @param lastUpdated 最終更新日時
 * @param maxAgeHours 最大許容時間（デフォルト: 24時間）
 * @returns true: 最新, false: 古い
 */
export function isProfileUpToDate(
  lastUpdated: string | null,
  maxAgeHours: number = 24
): boolean {
  if (!lastUpdated) return false;
  
  const lastUpdateTime = new Date(lastUpdated);
  const now = new Date();
  const diffHours = (now.getTime() - lastUpdateTime.getTime()) / (1000 * 60 * 60);
  
  return diffHours < maxAgeHours;
}