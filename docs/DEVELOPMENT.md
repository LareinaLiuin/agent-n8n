# 开发指南

## 项目架构

### 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS + Vite
- **后端**: Node.js + Express + TypeScript + OpenAI API
- **开发工具**: ESLint + Prettier + Husky

### 目录结构

```
n8n-agent-assistant/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/      # React组件
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── services/       # API服务
│   │   ├── types/          # TypeScript类型定义
│   │   └── utils/          # 工具函数
│   ├── public/             # 静态资源
│   └── package.json
├── backend/                 # Node.js后端服务
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务服务
│   │   ├── routes/         # 路由定义
│   │   ├── types/          # TypeScript类型定义
│   │   ├── utils/          # 工具函数
│   │   └── index.ts        # 应用入口
│   └── package.json
├── docs/                   # 项目文档
└── README.md
```

## 开发环境搭建

### 1. 环境要求

- Node.js 16+
- npm 8+
- Git
- OpenAI API Key

### 2. 克隆项目

```bash
git clone <repository-url>
cd n8n-agent-assistant
```

### 3. 后端开发

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，添加你的配置

# 启动开发服务器
npm run dev
```

环境变量配置：

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Application Configuration
APP_NAME=n8n Agent Assistant
APP_VERSION=1.0.0
```

### 4. 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 启动开发服务器
npm run dev
```

环境变量配置：

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Application Configuration
VITE_APP_NAME=n8n Agent Assistant
VITE_APP_VERSION=1.0.0
```

## 核心模块开发

### 1. 前端组件开发

#### ChatInterface 组件

位置：`frontend/src/components/ChatInterface.tsx`

主要功能：
- 消息显示和输入
- 实时对话交互
- 状态管理和错误处理

```typescript
interface ChatInterfaceProps {
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isLoading, sendMessage, resetChat } = useChat();

  // 组件逻辑...
};
```

#### 自定义Hooks

位置：`frontend/src/hooks/useChat.ts`

主要功能：
- 状态管理
- API调用
- 错误处理

```typescript
interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string | null;
  currentSOP: SOP | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  resetChat: () => void;
}

export const useChat = (): UseChatReturn => {
  // Hook逻辑...
};
```

### 2. 后端服务开发

#### OpenAI服务

位置：`backend/src/services/openai.service.ts`

主要功能：
- OpenAI API集成
- 智能对话生成
- SOP生成
- 代码生成

```typescript
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    // OpenAI API调用逻辑...
  }

  async generateSOP(userInput: string): Promise<SOPIdea> {
    // SOP生成逻辑...
  }

  async generateJavaScriptCode(requirement: string): Promise<CodeResult> {
    // 代码生成逻辑...
  }
}
```

#### 控制器

位置：`backend/src/controllers/`

主要功能：
- 请求处理
- 响应格式化
- 错误处理

```typescript
export class ChatController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { message, sessionId } = req.body;

      // 业务逻辑处理...

      const response: ApiResponse = {
        success: true,
        data: result,
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
}
```

## API 接口文档

### 聊天接口

#### 发送消息
```
POST /api/chat/message
Content-Type: application/json

{
  "message": "用户消息内容",
  "sessionId": "session_id"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "message_id",
      "role": "assistant",
      "content": "回复内容",
      "timestamp": "2023-12-01T10:00:00Z"
    },
    "sessionId": "session_id"
  },
  "message": "消息发送成功"
}
```

#### 创建会话
```
POST /api/chat/session
```

响应：
```json
{
  "success": true,
  "data": {
    "sessionId": "new_session_id",
    "session": {
      "id": "new_session_id",
      "messages": [],
      "createdAt": "2023-12-01T10:00:00Z",
      "updatedAt": "2023-12-01T10:00:00Z"
    }
  },
  "message": "会话创建成功"
}
```

### SOP接口

#### 生成SOP建议
```
POST /api/sop/generate
Content-Type: application/json

{
  "userInput": "用户输入的需求描述"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "title": "SOP标题",
    "description": "SOP描述",
    "goal": "SOP目标",
    "steps": [
      {
        "title": "步骤标题",
        "description": "步骤描述",
        "type": "trigger|action|condition|data_processing|output"
      }
    ]
  },
  "message": "SOP建议生成成功"
}
```

### 代码生成接口

#### 生成JavaScript代码
```
POST /api/code/generate
Content-Type: application/json

{
  "requirement": "代码需求描述",
  "context": {
    "inputData": {},
    "outputData": {}
  }
}
```

响应：
```json
{
  "success": true,
  "data": {
    "code": "生成的JavaScript代码",
    "explanation": "代码说明",
    "language": "javascript",
    "dependencies": ["依赖包"]
  },
  "message": "代码生成成功"
}
```

## 数据模型

### ChatMessage

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    sopId?: string;
    stepId?: string;
    nodeRecommendation?: N8nNodeRecommendation;
    codeSnippet?: string;
  };
}
```

### SOP

```typescript
interface SOP {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: SOPStep[];
  createdAt: Date;
  updatedAt: Date;
}

interface SOPStep {
  id: string;
  title: string;
  description: string;
  type: 'trigger' | 'action' | 'condition' | 'data_processing' | 'output';
  n8nNode?: N8nNodeRecommendation;
  codeSnippet?: string;
  order: number;
}
```

### N8nNodeRecommendation

```typescript
interface N8nNodeRecommendation {
  nodeName: string;
  displayName: string;
  reason: string;
  configuration: Record<string, any>;
  connections?: string[];
}
```

## 开发规范

### 1. 代码风格

使用 ESLint 和 Prettier 进行代码格式化：

```bash
# 格式化代码
npm run format

# 检查代码规范
npm run lint
```

### 2. 提交规范

使用 Conventional Commits：

```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 3. 分支管理

```
main: 主分支，生产环境代码
develop: 开发分支，集成最新功能
feature/*: 功能分支
hotfix/*: 热修复分支
```

### 4. 测试

```bash
# 运行测试
npm test

# 运行测试覆盖率
npm run test:coverage
```

## 性能优化

### 前端优化

1. **代码分割**
```typescript
// 使用动态导入
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

2. **状态优化**
```typescript
// 使用 useMemo 缓存计算结果
const filteredMessages = useMemo(() => {
  return messages.filter(msg => msg.type === 'user');
}, [messages]);
```

3. **组件优化**
```typescript
// 使用 React.memo 避免不必要的重渲染
export const MessageComponent = React.memo(({ message }) => {
  // 组件逻辑
});
```

### 后端优化

1. **缓存策略**
```typescript
// 使用内存缓存
const cache = new Map();

function getCachedResponse(key: string) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  return null;
}
```

2. **API限流**
```typescript
// 限制请求频率
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制100个请求
});

app.use('/api/', limiter);
```

## 错误处理

### 前端错误处理

```typescript
// 错误边界
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### 后端错误处理

```typescript
// 全局错误处理中间件
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

## 调试技巧

### 前端调试

1. **React DevTools**
2. **Redux DevTools**（如使用Redux）
3. **Console 日志**
```typescript
console.log('Debug info:', { messages, isLoading });
```

### 后端调试

1. **VS Code Debug 配置**
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/src/index.ts",
  "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
  "runtimeArgs": ["-r", "ts-node/register"]
}
```

2. **日志记录**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'debug.log' })
  ]
});
```

## 部署流程

### 1. 构建应用

```bash
# 构建后端
cd backend && npm run build

# 构建前端
cd frontend && npm run build
```

### 2. Docker部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 3. 环境变量配置

确保所有必要的环境变量都已正确配置：

```bash
# 检查环境变量
printenv | grep -E "(OPENAI|API|DATABASE)"
```

## 贡献指南

### 1. Fork 项目

在 GitHub 上 Fork 项目到你的账户

### 2. 创建功能分支

```bash
git checkout -b feature/your-feature-name
```

### 3. 提交代码

```bash
git add .
git commit -m "feat: 添加新功能描述"
git push origin feature/your-feature-name
```

### 4. 创建 Pull Request

在 GitHub 上创建 Pull Request，描述你的更改

### 5. 代码审查

等待维护者审查代码并进行必要的修改

## 常见问题

### Q: 如何添加新的AI服务？
A: 在 `backend/src/services/` 目录下创建新的服务文件，实现相应的接口。

### Q: 如何扩展前端组件？
A: 在 `frontend/src/components/` 目录下添加新组件，并在相应的地方引入使用。

### Q: 如何自定义API响应格式？
A: 修改 `backend/src/types/index.ts` 中的类型定义，并更新相应的控制器。

## 文档维护

- 及时更新 API 文档
- 添加新功能的使用示例
- 更新部署和配置说明
- 记录重要的设计决策

---

开始开发，让智能体构建更智能！🚀