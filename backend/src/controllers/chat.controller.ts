import { Request, Response } from 'express';
import { OpenAIService } from '../services/openai.service';
import { ApiResponse, ChatMessage } from '../types';

// 内存存储（生产环境应该使用数据库）
const chatSessions = new Map<string, {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}>();

// 使用单例模式的OpenAI服务
const openaiService = new OpenAIService();

export class ChatController {
  // 创建新会话
  async createSession(req: Request, res: Response) {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const session = {
        id: sessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      chatSessions.set(sessionId, session);

      const response: ApiResponse = {
        success: true,
        data: {
          sessionId,
          session,
        },
        message: '会话创建成功',
      };

      res.json(response);
    } catch (error) {
      console.error('Create session error:', error);
      const response: ApiResponse = {
        success: false,
        error: '会话创建失败',
      };
      res.status(500).json(response);
    }
  }

  // 获取会话信息
  async getSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;

      const session = chatSessions.get(sessionId);
      if (!session) {
        const response: ApiResponse = {
          success: false,
          error: '会话不存在',
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: {
          session,
          messages: session.messages,
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Get session error:', error);
      const response: ApiResponse = {
        success: false,
        error: '获取会话失败',
      };
      res.status(500).json(response);
    }
  }

  // 发送消息
  async sendMessage(req: Request, res: Response) {
    try {
      const { message, sessionId } = req.body;

      if (!message || !sessionId) {
        const response: ApiResponse = {
          success: false,
          error: '消息内容和会话ID不能为空',
        };
        return res.status(400).json(response);
      }

      const session = chatSessions.get(sessionId);
      if (!session) {
        const response: ApiResponse = {
          success: false,
          error: '会话不存在',
        };
        return res.status(404).json(response);
      }

      // 创建用户消息
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message,
        timestamp: new Date(),
      };

      session.messages.push(userMessage);

      // 调用AI服务获取回复
      const aiResponse = await openaiService.sendMessage(
        session.messages,
        {
          // 这里可以添加上下文信息，如当前SOP等
        }
      );

      // 创建AI回复消息
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      session.messages.push(assistantMessage);
      session.updatedAt = new Date();

      const response: ApiResponse = {
        success: true,
        data: {
          message: assistantMessage,
          sessionId,
        },
        message: '消息发送成功',
      };

      res.json(response);
    } catch (error) {
      console.error('Send message error:', error);
      const response: ApiResponse = {
        success: false,
        error: '消息发送失败',
      };
      res.status(500).json(response);
    }
  }

  // 删除会话
  async deleteSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;

      const session = chatSessions.get(sessionId);
      if (!session) {
        const response: ApiResponse = {
          success: false,
          error: '会话不存在',
        };
        return res.status(404).json(response);
      }

      chatSessions.delete(sessionId);

      const response: ApiResponse = {
        success: true,
        message: '会话删除成功',
      };

      res.json(response);
    } catch (error) {
      console.error('Delete session error:', error);
      const response: ApiResponse = {
        success: false,
        error: '会话删除失败',
      };
      res.status(500).json(response);
    }
  }

  // 获取所有会话列表（调试用）
  async getAllSessions(req: Request, res: Response) {
    try {
      const sessions = Array.from(chatSessions.values()).map(session => ({
        id: session.id,
        messageCount: session.messages.length,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }));

      const response: ApiResponse = {
        success: true,
        data: { sessions },
      };

      res.json(response);
    } catch (error) {
      console.error('Get all sessions error:', error);
      const response: ApiResponse = {
        success: false,
        error: '获取会话列表失败',
      };
      res.status(500).json(response);
    }
  }
}