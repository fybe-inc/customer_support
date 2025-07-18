"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, Sparkles, MessageCircle, Clock, User, CheckCircle, Edit3 } from "lucide-react";
import { tables } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { subscribeLineChats } from '@/lib/realtime/line_chats';
import { subscribeLineMessages } from '@/lib/realtime/line_chats';

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;

  const [chats, setChats] = useState<
    Array<{
      id: string;
      display_name: string | null;
      line_user_id: string;
      updated_at: string | null;
      profile?: {
        display_name: string;
        picture_url: string | null;
        status_message: string | null;
      } | null;
    }>
  >([]);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      message_text: string | null;
      is_from_user: boolean;
      timestamp: string | null;
    }>
  >([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<Array<{
    reply: string;
    scenarioType: string;
    notes: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const { lineChats } = tables(supabase);

    const loadChats = async () => {
      try {
        const chatsData = await lineChats.findAllWithProfiles();
        setChats(chatsData);
      } catch (error) {
        console.error("Error loading chats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();

    const unsubscribe = subscribeLineChats(supabase, (payload) => {
      console.log('Line chats realtime update:', payload);
      // リアルタイム更新でより効率的に処理
      if (payload.eventType === 'INSERT') {
        loadChats(); // 新しいチャットが追加された場合
      } else if (payload.eventType === 'UPDATE') {
        loadChats(); // チャットが更新された場合
      } else if (payload.eventType === 'DELETE') {
        loadChats(); // チャットが削除された場合
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!chatId) return;
    const supabase = createClient();
    const { lineMessages } = tables(supabase);

    const loadMessages = async () => {
      try {
        const messagesData = await lineMessages.findByChatId(chatId);
        setMessages([...messagesData].reverse());
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();

    const unsubscribe = subscribeLineMessages(supabase, chatId, (payload) => {
      console.log('Line messages realtime update:', payload);
      // リアルタイム更新でより効率的に処理
      if (payload.eventType === 'INSERT') {
        // 新しいメッセージが追加された場合、配列に直接追加
        const newMessage = payload.newRecord as {
          id: string;
          message_text: string | null;
          is_from_user: boolean;
          timestamp: string | null;
        };
        if (newMessage) {
          setMessages(prevMessages => [...prevMessages, newMessage]);
        }
      } else if (payload.eventType === 'UPDATE') {
        // メッセージが更新された場合
        const updatedMessage = payload.newRecord as {
          id: string;
          message_text: string | null;
          is_from_user: boolean;
          timestamp: string | null;
        };
        if (updatedMessage) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      } else if (payload.eventType === 'DELETE') {
        // メッセージが削除された場合
        const deletedMessage = payload.oldRecord as {
          id: string;
          message_text: string | null;
          is_from_user: boolean;
          timestamp: string | null;
        };
        if (deletedMessage) {
          setMessages(prevMessages => 
            prevMessages.filter(msg => msg.id !== deletedMessage.id)
          );
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent, customMessage?: string) => {
    e.preventDefault();
    const messageToSend = customMessage || message.trim();
    if (!messageToSend || !chatId) return;

    try {
      const response = await fetch("/api/line/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: chatId,
          message: messageToSend,
        }),
      });

      if (!response.ok) {
        throw new Error("メッセージの送信に失敗しました");
      }

      const data = await response.json();

      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }

      setMessage("");
      setAiSuggestions([]);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("メッセージの送信に失敗しました");
    }
  };

  const fetchAISuggestions = async (lastMessage: string) => {
    console.log('Fetching AI suggestions for:', lastMessage, 'chatId:', chatId);
    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inquiry: lastMessage,
          chatId: chatId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API response error:', response.status, errorText);
        throw new Error('AI提案の取得に失敗しました');
      }

      const data = await response.json();
      console.log('AI suggestions received:', data);
      setAiSuggestions(data.scenarios || []);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      setAiSuggestions([]); // エラー時は空の配列に設定
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // 自動スクロール機能
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiSuggestions, loadingSuggestions]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log('Last message:', lastMessage);
      if (lastMessage.is_from_user && lastMessage.message_text) {
        console.log('Triggering AI suggestions for customer message');
        fetchAISuggestions(lastMessage.message_text);
      } else {
        console.log('Not triggering AI suggestions - not a customer message');
        setAiSuggestions([]);
      }
    }
  }, [messages, fetchAISuggestions]);

  const selectedChat = chats.find((chat) => chat.id === chatId);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 左側: チャット一覧 */}
      <div className="w-1/3 bg-white/80 backdrop-blur-sm border-r border-slate-200/50 flex flex-col shadow-lg">
        <div className="p-4 border-b border-slate-200/50 bg-white/60">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            チャット一覧
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>チャットがありません</p>
            </div>
          ) : (
            chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/${chat.id}`}
                className={`block p-4 border-b border-slate-100/50 hover:bg-white/60 transition-all duration-200 ${
                  chatId === chat.id
                    ? "bg-emerald-50/80 border-r-4 border-r-emerald-500 shadow-sm"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {chat.profile?.picture_url ? (
                      <img
                        src={chat.profile.picture_url}
                        alt={chat.profile.display_name || "User"}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-100"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-sm font-semibold text-white">
                          {chat.profile?.display_name?.charAt(0) ||
                            chat.display_name?.charAt(0) ||
                            "U"}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {chat.profile?.display_name ||
                        chat.display_name ||
                        "LINE User"}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">
                      {chat.profile?.status_message ||
                        `LINE ID: ${chat.line_user_id}`}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {chat.updated_at
                        ? new Date(chat.updated_at).toLocaleTimeString(
                            "ja-JP",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : ""}
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
            {/* チャットヘッダー */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {selectedChat.profile?.picture_url ? (
                    <img
                      src={selectedChat.profile.picture_url}
                      alt={selectedChat.profile.display_name || "User"}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {selectedChat.profile?.display_name?.charAt(0) ||
                          selectedChat.display_name?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {selectedChat.profile?.display_name ||
                      selectedChat.display_name ||
                      "LINE User"}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    オンライン
                  </p>
                </div>
              </div>
            </div>

            {/* メッセージ */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p>メッセージがありません</p>
                  <p className="text-sm mt-2">会話を始めましょう</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      msg.is_from_user ? "justify-start" : "justify-end"
                    }`}
                  >
                    {msg.is_from_user && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-white">
                          {selectedChat.profile?.display_name?.charAt(0) ||
                            selectedChat.display_name?.charAt(0) ||
                            "U"}
                        </span>
                      </div>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        msg.is_from_user
                          ? "bg-white text-slate-900 border border-slate-200 rounded-bl-md"
                          : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.message_text || "メッセージ内容なし"}
                      </p>
                      <div className={`flex items-center gap-2 mt-2 ${
                        msg.is_from_user ? "justify-start" : "justify-end"
                      }`}>
                        <p className={`text-xs ${
                          msg.is_from_user ? "text-slate-500" : "text-emerald-100"
                        }`}>
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString(
                                "ja-JP",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : ""}
                        </p>
                        {!msg.is_from_user && (
                          <CheckCircle className="w-3 h-3 text-emerald-200" />
                        )}
                      </div>
                    </div>
                    {!msg.is_from_user && (
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* AI提案 */}
              {aiSuggestions.length > 0 && (
                <div className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50 rounded-2xl shadow-sm">
                  <div className="p-4 border-b border-purple-200/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">AI返信提案</h3>
                      <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                      <div className="flex-1"></div>
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        {aiSuggestions.length}件の提案
                      </span>
                    </div>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <div className="flex gap-4 pb-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="w-2/3 flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover:border-purple-200 transition-all duration-200 hover:shadow-md group">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                suggestion.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                                suggestion.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {suggestion.scenarioType}
                              </span>
                            </div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                              suggestion.sentiment === 'positive' ? 'bg-emerald-100' :
                              suggestion.sentiment === 'negative' ? 'bg-red-100' :
                              'bg-slate-100'
                            }`}>
                              {suggestion.sentiment === 'positive' ? '😊' :
                               suggestion.sentiment === 'negative' ? '😔' : '😐'}
                            </div>
                          </div>
                          <p className="text-sm text-slate-800 mb-3 whitespace-pre-wrap leading-relaxed line-clamp-4">
                            {suggestion.reply}
                          </p>
                          <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg line-clamp-2">
                            💡 {suggestion.notes}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setMessage(suggestion.reply)}
                              className="flex-1 py-3 px-4 bg-gradient-to-r from-slate-500 to-slate-600 text-white text-sm rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm group-hover:shadow-md"
                            >
                              <Edit3 className="w-4 h-4" />
                              編集
                            </button>
                            <button
                              onClick={(e) => handleSendMessage(e, suggestion.reply)}
                              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm group-hover:shadow-md"
                            >
                              <Send className="w-4 h-4" />
                              送信
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ローディング状態 */}
              {loadingSuggestions && (
                <div className="mx-4 mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-300 border-t-purple-600"></div>
                      <span className="text-sm text-slate-700 font-medium">AI返信提案を生成中...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 自動スクロール用の要素 */}
              <div ref={messagesEndRef} />
            </div>

            {/* メッセージ入力 */}
            <div className="bg-white/80 backdrop-blur-sm border-t border-slate-200/50 p-4">
              <form
                onSubmit={handleSendMessage}
                className="flex items-end space-x-3"
              >
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="メッセージを入力..."
                    className="w-full border border-slate-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white/80 backdrop-blur-sm transition-all duration-200 resize-none overflow-y-auto"
                    rows={3}
                  />
                  <div className="absolute right-3 top-3 text-slate-400">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-sm self-end"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">チャットを選択してください</h3>
              <p className="text-slate-500">左側からチャットを選んで会話を始めましょう</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}