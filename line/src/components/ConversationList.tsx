'use client';

import { StoredMessage } from '@/types/line';
import { MessageCircle, Clock } from 'lucide-react';

interface ConversationListProps {
  conversations: Map<string, StoredMessage[]>;
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

export default function ConversationList({ conversations, selectedUserId, onSelectUser }: ConversationListProps) {
  const getLastMessage = (messages: StoredMessage[]) => {
    return messages[messages.length - 1];
  };

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '昨日';
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
    }
  };

  return (
    <div className="w-80 bg-gray-50 flex flex-col">
      <div className="h-[72px] px-4 bg-green-600 text-white flex items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageCircle size={24} />
          会話一覧
        </h2>
      </div>
      <div className="divide-y overflow-y-auto flex-1">
        {Array.from(conversations.entries()).map(([userId, messages]) => {
          const lastMessage = getLastMessage(messages);
          const unreadCount = messages.filter(m => m.isFromUser && !m.replyToken).length;
          
          return (
            <div
              key={userId}
              onClick={() => onSelectUser(userId)}
              className={`p-4 hover:bg-gray-100 cursor-pointer transition-colors ${
                selectedUserId === userId ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-gray-900">
                  {lastMessage.userName || 'Unknown User'}
                </h3>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={12} className="mr-1" />
                  {formatTime(lastMessage.timestamp)}
                </div>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {lastMessage.message}
              </p>
              {unreadCount > 0 && (
                <span className="inline-block mt-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          );
        })}
        {conversations.size === 0 && (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-2 opacity-20" />
            <p>まだ会話がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}