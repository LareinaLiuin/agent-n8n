import axios from 'axios';
import type { ChatMessage, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 简化的API客户端
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 增加超时时间到60秒
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // 简化CORS配置
});

// 添加请求拦截器进行调试
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器进行调试
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      data: response.data,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

// 聊天相关API - 简化版本
export const chatApi = {
  // 创建新会话
  createSession: async (): Promise<ApiResponse<{
    sessionId: string;
    session: any;
  }>> => {
    try {
      const response = await apiClient.post('/chat/session');
      return response.data;
    } catch (error: any) {
      console.error('Create session error:', error);
      throw error;
    }
  },

  // 发送消息
  sendMessage: async (message: string, sessionId?: string): Promise<ApiResponse<{
    message: ChatMessage;
    sessionId: string;
  }>> => {
    try {
      console.log('Sending message:', { message, sessionId });
      const response = await apiClient.post('/chat/message', {
        message,
        sessionId,
      });
      console.log('Message response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // 获取聊天历史
  getChatHistory: async (sessionId: string): Promise<ApiResponse<{
    messages: ChatMessage[];
    session: any;
  }>> => {
    try {
      const response = await apiClient.get(`/chat/session/${sessionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get chat history error:', error);
      throw error;
    }
  },
};

export default apiClient;