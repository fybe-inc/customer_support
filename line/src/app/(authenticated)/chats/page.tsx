'use client';

import { useState, useEffect } from 'react';
import { tables } from '@/lib/db';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
export default function Page() {
  const [chats, setChats] = useState<Array<{ id: string; display_name: string | null; line_user_id: string; updated_at: string | null; profile?: { display_name: string; picture_url: string | null; status_message: string | null } | null }>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadChats = async () => {
      try {
        const supabase = createClient();
        const {lineChats} = tables(supabase);
        const chatsData = await lineChats.findAllWithProfiles();
        setChats(chatsData);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        {chats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">チャットがありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chats/${chat.id}`}
                className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {chat.profile?.picture_url ? (
                      <img
                        src={chat.profile.picture_url}
                        alt={chat.profile.display_name || 'User'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {chat.profile?.display_name?.charAt(0) || chat.display_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {chat.profile?.display_name || chat.display_name || 'LINE User'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {chat.profile?.status_message || `LINE ID: ${chat.line_user_id}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      最終更新: {chat.updated_at ? new Date(chat.updated_at).toLocaleString('ja-JP') : ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}