import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAIService } from './services/openai.service';
import { ChatMessage } from './types';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    app: 'n8n Agent Assistant',
    version: '1.0.0',
    message: 'Backend is running'
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'n8n Agent Assistant Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      session: '/api/chat/session',
      message: '/api/chat/message'
    }
  });
});

// 聊天会话创建
app.post('/api/chat/session', (req, res) => {
  const sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

  console.log('Creating session:', sessionId);

  res.json({
    success: true,
    data: {
      sessionId: sessionId,
      session: {
        id: sessionId,
        createdAt: new Date().toISOString()
      }
    }
  });
});

// 聊天消息处理
app.post('/api/chat/message', async (req, res) => {
  try {
    console.log('Received message request:', req.body);

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log('Processing message:', message);

    // 初始化OpenAI服务
    const openAIService = new OpenAIService();

    // 生成AI回复
    const messages: ChatMessage[] = [
      { role: 'user', content: message }
    ];
    const aiResponse = await openAIService.sendMessage(messages);

    const response = {
      success: true,
      data: {
        message: {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString()
        }
      }
    };

    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error: any) {
    console.error('Error processing message:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});


// 启动服务器
app.listen(PORT, () => {
  console.log(`
🚀 n8n Agent Assistant Backend Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
⏰ Started at: ${new Date().toLocaleString('zh-CN')}

📚 Available endpoints:
  - GET  /health
  - POST /api/chat/session
  - POST /api/chat/message
  - GET  /
  `);
});