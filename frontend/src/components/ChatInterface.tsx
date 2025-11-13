import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, RotateCcw } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { ChatMessage } from '../types';
import '../styles/markdown.css';

interface ChatInterfaceProps {
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isLoading, sendMessage, resetChat } = useChat();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isLoading) {
      await sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 自动调整文本框高度
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';

    return (
      <div
        key={message.id}
        className={`message ${isUser ? 'user' : 'assistant'}`}
      >
        <div className="message-bubble">
          {isUser ? (
            message.content
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
          <div style={{
            fontSize: '12px',
            color: isUser ? '#ddd' : '#6b7280',
            marginTop: '8px'
          }}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* 聊天消息区域 */}
      <div className="chat-container" ref={(el) => {
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            <Bot style={{ width: '48px', height: '48px', marginBottom: '16px', color: '#d1d5db' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
              欢迎使用 n8n 智能体构建助手！
            </h2>
            <p style={{ fontSize: '14px', textAlign: 'center', maxWidth: '400px', marginBottom: '16px' }}>
              告诉我你想要构建什么样的智能体工作流，我会一步步指导你完成从想法到实际搭建的全过程。
            </p>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>你可以这样开始：</p>
              <ul style={{ fontSize: '14px', paddingLeft: '20px', color: '#6b7280' }}>
                <li>• "我想做一个自动化的邮件处理助手"</li>
                <li>• "帮我设计一个社交媒体内容发布流程"</li>
                <li>• "我需要一个数据同步的工作流"</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map(renderMessage)
        )}

        {/* 加载指示器 */}
        {isLoading && (
          <div className="message assistant">
            <div className="message-bubble">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="input-container">
        <div className="input-group">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="描述你的想法或问题..."
            className="input-field"
            rows={1}
            disabled={isLoading}
            style={{
              minHeight: '44px',
              maxHeight: '120px',
              resize: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? (
              <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Send style={{ width: '20px', height: '20px' }} />
            )}
          </button>
          <button
            onClick={resetChat}
            style={{
              marginLeft: '8px',
              padding: '0 16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            title="重新开始"
          >
            <RotateCcw style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <span>按 Enter 发送，Shift + Enter 换行</span>
          <span>{inputMessage.length}/1000</span>
        </div>
      </div>
    </div>
  );
};