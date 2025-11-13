import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRoutes } from '../backend/src/routes/chat';
import { sopRoutes } from '../backend/src/routes/sop';
import { codeRoutes } from '../backend/src/routes/code';
import { validationRoutes } from '../backend/src/routes/validation';
import { OpenAIServiceManager } from '../backend/src/services/openai.service.manager';

// 加载环境变量
dotenv.config();

// 初始化OpenAI服务管理器
const openAIManager = OpenAIServiceManager.getInstance();
if (openAIManager.isConfigured()) {
  openAIManager.initialize();
}

// 创建Express应用
const app = express();

// 中间件配置
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查端点
app.get('/health', (req, res) => {
  const openaiConfig = openAIManager.getConfig();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    app: process.env.APP_NAME || 'n8n Agent Assistant',
    version: process.env.APP_VERSION || '1.0.0',
    openai: {
      configured: openAIManager.isConfigured(),
      baseURL: openaiConfig?.baseURL || null,
      hasApiKey: !!openaiConfig?.apiKey
    }
  });
});

// API路由
app.use('/chat', chatRoutes);
app.use('/sop', sopRoutes);
app.use('/code', codeRoutes);
app.use('/validation', validationRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// 全局错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Vercel Serverless Function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}