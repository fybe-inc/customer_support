'use client';

import { useState, useEffect } from 'react';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';
import ConversationList from '@/components/ConversationList';
import { StoredMessage } from '@/types/line';
import { Send, RefreshCw, Users } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/webhook');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const conversations = new Map<string, StoredMessage[]>();
  messages.forEach((message) => {
    if (!conversations.has(message.userId)) {
      conversations.set(message.userId, []);
    }
    conversations.get(message.userId)!.push(message);
  });

  const selectedMessages = selectedUserId ? conversations.get(selectedUserId) || [] : [];

  const handleSendMessage = async (text: string) => {
    if (!selectedUserId || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/line/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          message: text,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
      } else {
        alert('メッセージの送信に失敗しました');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('メッセージの送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ConversationList
        conversations={conversations}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
      />
      
      <div className="flex-1 flex flex-col bg-white">
        <div className="h-[72px] bg-green-600 text-white px-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Send size={24} />
              LINE カスタマーサポート
            </h1>
            {selectedUserId && (
              <p className="text-sm opacity-90">
                {conversations.get(selectedUserId)?.[0]?.userName || 'Unknown User'}
              </p>
            )}
          </div>
          <button
            onClick={fetchMessages}
            disabled={isLoading}
            className="p-2 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {selectedUserId ? (
          <>
            <MessageList messages={selectedMessages} />
            <MessageInput onSend={handleSendMessage} disabled={isSending} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Users size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">会話を選択してください</p>
              <p className="text-sm mt-2">左側のリストから会話を選択すると、メッセージが表示されます</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
