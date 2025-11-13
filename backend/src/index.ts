import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRoutes } from './routes/chat';
import { sopRoutes } from './routes/sop';
import { codeRoutes } from './routes/code';
import { validateRoutes } from './routes/validation';
import { OpenAIServiceManager } from './services/openai.service.manager';

// 加载环境变量
console.log('🔍 Loading environment variables...');
const result = dotenv.config();
if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
} else {
  console.log('✅ Environment variables loaded successfully');
  console.log('🔍 OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'undefined');
  console.log('🔍 OPENAI_BASE_URL:', process.env.OPENAI_BASE_URL);
}

// 初始化OpenAI服务管理器
console.log('🔍 Initializing OpenAI Service Manager...');
const openAIManager = OpenAIServiceManager.getInstance();
if (openAIManager.isConfigured()) {
  openAIManager.initialize();
  console.log('✅ OpenAI Service Manager initialized successfully');
} else {
  console.warn('⚠️ OpenAI Service Manager not configured - AI features will be disabled');
}

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // 支持Vite默认端口
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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
app.use('/api/chat', chatRoutes);
app.use('/api/sop', sopRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/validation', validateRoutes);

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

// 启动服务器
app.listen(PORT, () => {
  console.log(`
🚀 n8n Agent Assistant Backend Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
⏰ Started at: ${new Date().toLocaleString()}
🔗 OpenAI Base URL: ${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}
  `);
});