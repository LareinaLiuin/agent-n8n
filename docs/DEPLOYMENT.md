# 部署指南

## 项目概述

n8n Agent Assistant 是一个专注于n8n平台的智能体构建辅助工具，通过对话式交互帮助用户从想法到完整工作流的实现。

## 技术架构

- **前端**: React + TypeScript + Tailwind CSS + Vite
- **后端**: Node.js + Express + TypeScript + OpenAI API
- **数据存储**: 内存存储（生产环境可升级为Redis/PostgreSQL）

## 环境要求

- Node.js 16+
- npm 或 yarn
- OpenAI API Key
- Git

## 快速部署

### 1. 克隆项目

```bash
git clone <repository-url>
cd n8n-agent-assistant
```

### 2. 后端部署

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，添加你的 OpenAI API Key
```

编辑 `.env` 文件：

```env
# OpenAI Configuration
OPENAI_API_KEY=your_actual_openai_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://your-domain.com

# Application Configuration
APP_NAME=n8n Agent Assistant
APP_VERSION=1.0.0
```

启动后端服务：

```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm start
```

### 3. 前端部署

```bash
# 进入前端目录
cd ../frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置后端API地址
```

编辑 `.env` 文件：

```env
# API Configuration
VITE_API_URL=https://your-backend-api.com/api

# Application Configuration
VITE_APP_NAME=n8n Agent Assistant
VITE_APP_VERSION=1.0.0
```

构建和部署：

```bash
# 构建生产版本
npm run build

# dist 目录就是构建后的文件，可以部署到任何静态文件服务器
```

## Docker 部署

### 1. 后端 Dockerfile

在 `backend/` 目录创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### 2. 前端 Dockerfile

在 `frontend/` 目录创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose

在项目根目录创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - FRONTEND_URL=${FRONTEND_URL}
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  node_modules_backend:
  node_modules_frontend:
```

使用 Docker Compose 部署：

```bash
# 创建环境变量文件
echo "OPENAI_API_KEY=your_api_key" > .env
echo "FRONTEND_URL=https://your-domain.com" >> .env

# 启动服务
docker-compose up -d
```

## 云平台部署

### Vercel 部署（前端）

1. 连接 GitHub 仓库到 Vercel
2. 设置环境变量：
   - `VITE_API_URL`: 后端API地址
3. 自动部署触发

### Railway 部署（后端）

1. 连接 GitHub 仓库到 Railway
2. 设置环境变量：
   - `OPENAI_API_KEY`: OpenAI API密钥
   - `NODE_ENV`: production
3. 自动部署触发

### Render 部署

1. 创建两个 Web Services：前端和后端
2. 配置构建命令和启动命令
3. 设置环境变量

## 生产环境优化

### 1. 数据持久化

当前使用内存存储，生产环境建议：

```javascript
// 使用 Redis
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// 使用 PostgreSQL
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

### 2. 错误监控

集成错误监控服务：

```javascript
// Sentry
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});
```

### 3. 日志管理

```javascript
// Winston
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### 4. 缓存策略

```javascript
// 内存缓存
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1小时缓存
```

## 安全配置

### 1. API 限流

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100个请求
});

app.use('/api/', limiter);
```

### 2. HTTPS 配置

```javascript
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert'),
};

https.createServer(options, app).listen(443);
```

### 3. 环境变量保护

确保敏感信息不提交到代码仓库：

```bash
# .gitignore
.env
*.key
*.cert
```

## 监控和维护

### 1. 健康检查

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

### 2. 性能监控

```javascript
// 响应时间监控
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });

  next();
});
```

## 故障排除

### 常见问题

1. **CORS 错误**
   - 检查 `FRONTEND_URL` 环境变量配置
   - 确认前端请求地址正确

2. **OpenAI API 错误**
   - 验证 API Key 是否有效
   - 检查 API 配额是否充足

3. **构建失败**
   - 清除 node_modules 重新安装
   - 检查 Node.js 版本兼容性

4. **内存不足**
   - 增加服务器内存
   - 优化代码，减少内存使用

### 日志查看

```bash
# Docker 容器日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 系统日志
tail -f /var/log/nginx/error.log
tail -f /var/log/syslog
```

## 扩展部署

### 水平扩展

使用负载均衡器：

```nginx
upstream backend {
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}
```

### 数据库扩展

- 读写分离
- 数据库分片
- 缓存层优化

## 联系支持

如有部署问题，请联系：
- 技术支持邮箱
- GitHub Issues
- 社区论坛