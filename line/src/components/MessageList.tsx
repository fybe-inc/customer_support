'use client';

import { StoredMessage } from '@/types/line';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: StoredMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.isFromUser ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
              message.isFromUser
                ? 'bg-gray-100 text-gray-900'
                : 'bg-green-500 text-white'
            }`}
          >
            {message.userName && (
              <p className="text-xs font-semibold mb-1 opacity-70">
                {message.userName}
              </p>
            )}
            <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
            <p className={`text-xs mt-1 ${
              message.isFromUser ? 'text-gray-500' : 'text-green-100'
            }`}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}