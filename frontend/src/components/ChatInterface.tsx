import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw } from 'lucide-react';
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
        <div className="message-avatar">
          {isUser ? '👤' : '🤖'}
        </div>
        <div className="message-content">
          <div className="message-bubble">
            {isUser ? (
              message.content
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
            <div style={{
              fontSize: '12px',
              color: isUser ? 'rgba(255,255,255,0.8)' : '#9ca3af',
              marginTop: '8px',
              textAlign: isUser ? 'right' : 'left',
              fontWeight: '500'
            }}>
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* 欢迎界面 - 居中显示 */}
      {messages.length === 0 && (
        <div className="welcome-container visible">
          <div className="welcome-message">
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🤖</div>
            <h2>n8n 智能体构建助手</h2>
            <p style={{ maxWidth: '500px', margin: '0 auto 30px' }}>
              告诉我你想要构建什么样的智能体工作流，<br />
              我会一步步指导你完成从想法到实际搭建的全过程。
            </p>

            <div className="suggestion-chips">
              <button
                className="suggestion-chip"
                onClick={() => setInputMessage("我想做一个自动化的邮件处理助手")}
              >
                📧 邮件自动化
              </button>
              <button
                className="suggestion-chip"
                onClick={() => setInputMessage("帮我设计一个社交媒体内容发布流程")}
              >
                📱 社交媒体管理
              </button>
              <button
                className="suggestion-chip"
                onClick={() => setInputMessage("我需要一个数据同步的工作流")}
              >
                🔄 数据同步
              </button>
              <button
                className="suggestion-chip"
                onClick={() => setInputMessage("如何创建自动化报告生成系统")}
              >
                📊 报告自动化
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 聊天消息区域 */}
      <div
        className={`chat-container ${messages.length > 0 ? 'has-messages' : ''}`}
        ref={(el) => {
          if (el) {
            el.scrollTop = el.scrollHeight;
          }
        }}
      >
        {messages.map(renderMessage)}

        {/* 加载指示器 */}
        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">
              🤖
            </div>
            <div className="message-content">
              <div className="message-bubble">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 输入区域 - 固定在底部 */}
      <div className="input-container">
        <div className="input-group">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={messages.length === 0 ? "描述你的想法或问题..." : "继续对话..."}
              className="input-field"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? (
              <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Send style={{ width: '18px', height: '18px' }} />
            )}
          </button>
          {messages.length > 0 && (
            <button
              onClick={resetChat}
              className="send-button"
              style={{
                background: '#6b7280',
                minWidth: '44px'
              }}
              title="重新开始对话"
            >
              <RotateCcw style={{ width: '16px', height: '16px' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};