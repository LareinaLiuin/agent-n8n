import { VercelRequest, VercelResponse } from '@vercel/node';

// 简化的健康检查端点
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 简单的路由处理
  const { url } = req;

  try {
    if (url === '/health' || url === '/api/health') {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        app: 'n8n Agent Assistant',
        version: '1.0.0',
        message: 'API is running'
      });
      return;
    }

    // 聊天端点 - 简化版本
    if (url?.includes('/chat/session') && req.method === 'POST') {
      res.json({
        success: true,
        data: {
          sessionId: 'demo-session-' + Date.now(),
          session: { id: 'demo-session-' + Date.now() }
        }
      });
      return;
    }

    // 消息端点 - 简化版本
    if (url?.includes('/chat/message') && req.method === 'POST') {
      const { message } = req.body;

      // 模拟AI响应
      const aiResponse = `这是一个演示回复。您说：${message}

在n8n中，您可以通过以下步骤实现自动化工作流：

## 📋 基本步骤

1. **创建触发器**
   - Webhook触发器
   - 定时触发器
   - 手动触发器

2. **添加处理节点**
   - 数据处理
   - 条件判断
   - 格式转换

3. **设置输出**
   - 发送通知
   - 保存数据
   - 调用其他API

## 🚀 开始使用

建议您先在n8n中创建一个简单的工作流来熟悉界面和基本操作。`;

      res.json({
        success: true,
        data: {
          message: {
            id: 'msg-' + Date.now(),
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
          },
          sessionId: 'demo-session-' + Date.now()
        }
      });
      return;
    }

    // 404处理
    res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      message: `路径 ${url} 不存在`
    });

  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || '服务器内部错误'
    });
  }
}