'use client';

import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { tables } from '@/lib/db';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  
  const [chats, setChats] = useState<Array<{ id: string; display_name: string | null; line_user_id: string; updated_at: string | null; profile?: { display_name: string; picture_url: string | null; status_message: string | null } | null }>>([]);
  const [messages, setMessages] = useState<Array<{ id: string; message_text: string | null; is_from_user: boolean; timestamp: string | null }>>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const supabase = createClient();
        const { lineChats } = tables(supabase);
        
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

  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) return;

      try {
        const supabase = createClient();
        const { lineMessages } = tables(supabase);
        
        const messagesData = await lineMessages.findByChatId(chatId);
        setMessages([...messagesData].reverse());
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !chatId) return;

    try {
      const response = await fetch('/api/line/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('メッセージの送信に失敗しました');
      }

      const data = await response.json();
      
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }
      
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('メッセージの送信に失敗しました');
    }
  };

  const selectedChat = chats.find(chat => chat.id === chatId);

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
    <div className="flex h-screen bg-gray-50">
      {/* 左側: チャット一覧 */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">チャット一覧</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              チャットがありません
            </div>
          ) : (
            chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/${chat.id}`}
                className={`block p-4 border-b border-gray-100 hover:bg-gray-50 ${
                  chatId === chat.id ? 'bg-green-50 border-r-4 border-r-green-500' : ''
                }`}
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
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {chat.profile?.display_name || chat.display_name || 'LINE User'}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.profile?.status_message || `LINE ID: ${chat.line_user_id}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {chat.updated_at ? new Date(chat.updated_at).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 右側: チャット欄 */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* メッセージ */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  メッセージがありません
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_from_user ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.is_from_user
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">
                        {msg.message_text || 'メッセージ内容なし'}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.is_from_user ? 'text-green-100' : 'text-gray-500'
                        }`}
                      >
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* メッセージ入力 */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="メッセージを入力..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-green-500"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-500 font-semibold">LINE</span>
              </div>
              <p className="text-gray-500">チャットを選択してください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}