import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { chatApi } from '../services/api';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  resetChat: () => void;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // 初始化聊天会话
  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = useCallback(async () => {
    try {
      console.log('Initializing chat...');
      const response = await chatApi.createSession();
      console.log('Session created:', response);
      if (response.success && response.data) {
        setSessionId(response.data.sessionId);
        console.log('Session ID set:', response.data.sessionId);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    console.log('Preparing to send message:', { content, sessionId, isLoading });

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('Calling sendMessage API...');
      const response = await chatApi.sendMessage(content, sessionId || undefined);
      console.log('API response received:', response);

      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          id: response.data.message.id,
          role: 'assistant',
          content: response.data.message.content,
          timestamp: new Date(response.data.message.timestamp),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `发送消息失败: ${error.message || '未知错误'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const resetChat = useCallback(async () => {
    clearChat();
    await initializeChat();
  }, [clearChat, initializeChat]);

  return {
    messages,
    isLoading,
    sessionId,
    sendMessage,
    clearChat,
    resetChat,
  };
};