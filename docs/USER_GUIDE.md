# 用户使用指南

## 产品介绍

欢迎使用 n8n Agent Assistant！这是一个专注于 n8n 平台的智能体构建辅助工具，通过对话式交互帮助您从想法到完整工作流的实现。

## 核心功能

### 🎯 SOP智能共创
- **需求澄清**: 通过结构化对话帮助您理清思路
- **流程梳理**: 将模糊想法转化为清晰的执行步骤
- **SOP结构优化**: 基于n8n最佳实践优化流程设计
- **标准化输出**: 生成可直接在n8n中执行的步骤清单

### 🔧 n8n工作流指导
- **智能节点推荐**: 根据SOP步骤推荐最适合的n8n节点
- **详细配置指导**: 提供每个节点的参数配置说明
- **数据流设计**: 指导节点间的数据传递逻辑
- **实时问题解答**: 解决搭建过程中的常见问题

### 💻 JavaScript代码助手
- **按需代码生成**: 根据功能需求生成可直接使用的代码
- **参数适配服务**: 根据用户具体配置调整代码参数
- **错误诊断修复**: 帮助识别和解决代码节点的错误
- **性能优化建议**: 提供代码改进和优化方案

## 快速开始

### 第一步：访问应用

在浏览器中打开应用地址：
- 本地开发：http://localhost:3000
- 生产环境：https://your-domain.com

### 第二步：开始对话

在聊天界面中，用自然语言描述您想要构建的工作流：

```
用户：我想做一个自动化的邮件处理助手

助手：您好！我很乐意帮您构建一个邮件处理助手的工作流。
让我先了解一下您的具体需求：

1. 您希望处理什么类型的邮件？（如：客户咨询、订单通知、系统告警等）
2. 需要执行什么操作？（如：分类归档、自动回复、数据提取等）
3. 有特定的触发条件吗？（如：收到新邮件、特定发件人、关键词匹配等）

请告诉我这些信息，我会为您设计一个完整的SOP！
```

### 第三步：构建SOP

通过对话逐步完善SOP：

```
用户：我想要处理客户的咨询邮件，需要提取订单号并回复确认信息

助手：明白了！基于您的需求，我为您设计了以下SOP：

**标题**: 客户咨询邮件自动化处理工作流
**目标**: 自动提取客户邮件中的订单号并生成确认回复

**步骤**:
1. **邮件触发器** - 监听指定邮箱的新邮件
2. **邮件解析** - 提取邮件内容和订单号
3. **数据验证** - 验证订单号格式
4. **响应生成** - 根据订单号生成确认信息
5. **邮件回复** - 自动发送回复邮件

这个流程设计如何？我们可以开始配置具体的n8n节点了！
```

### 第四步：配置n8n节点

助手会为每个步骤推荐具体的n8n节点：

```
助手：对于第一步"邮件触发器"，我推荐使用 **Email Trigger** 节点：

**节点配置**：
- IMAP服务器: 您的邮箱提供商
- 用户名: 邮箱地址
- 密码: 邮箱密码或应用专用密码
- 文件夹: INBOX
- 读取选项: 标记为已读

**连接配置**：此节点作为工作流起点，连接到邮件解析节点

需要我帮您生成后续步骤的节点配置吗？
```

### 第五步：代码生成（如需要）

当需要复杂的数据处理时，助手会生成JavaScript代码：

```
用户：我需要从邮件内容中提取订单号，格式通常是 "ORD-123456"

助手：好的！我为您生成一个Function节点的代码来提取订单号：

```javascript
// 订单号提取函数
const emailText = $input.first().json.text || '';
const orderPattern = /ORD-\d{6}/g;
const orderNumbers = emailText.match(orderPattern);

if (orderNumbers && orderNumbers.length > 0) {
  return [{
    json: {
      orderNumbers: orderNumbers,
      emailText: emailText,
      extractedAt: new Date().toISOString()
    }
  }];
} else {
  return [{
    json: {
      error: '未找到有效订单号',
      emailText: emailText,
      requiresManualReview: true
    }
  }];
}
```

这段代码会：
1. 从邮件文本中提取 "ORD-" 开头的订单号
2. 返回提取结果或错误信息
3. 包含处理时间戳

需要我解释代码的具体逻辑吗？
```

## 高级功能

### 复杂流程设计

对于复杂的业务逻辑，助手可以帮助设计：

```
用户：如果订单号验证失败，我需要人工审核

助手：好的！我为您修改SOP，添加条件分支：

**更新后的SOP**：
1. **邮件触发器** - 监听新邮件
2. **邮件解析** - 提取邮件内容和订单号
3. **订单验证** - 验证订单号有效性
4. **条件判断** - 根据验证结果分支
   - ✅ 验证成功 → 生成自动回复
   - ❌ 验证失败 → 创建人工审核任务
5. **响应处理** - 执行相应操作

**推荐节点**：
- **IF节点**: 用于条件判断
- **Slack节点**: 发送人工审核通知到Slack频道
- **Set节点**: 设置不同情况下的响应数据
```

### 错误处理

助手会帮助添加完善的错误处理：

```
用户：如果网络出现问题怎么办？

助手：很好的问题！我建议添加以下错误处理机制：

**错误处理策略**：
1. **重试机制**: 对于网络失败的操作，最多重试3次
2. **备用路径**: 当主要流程失败时，切换到备用方案
3. **错误通知**: 及时发送错误告警
4. **数据备份**: 保存处理失败的邮件，便于后续处理

**实现方案**：
```javascript
// 错误处理示例
try {
  const result = await processEmail(emailData);
  return result;
} catch (error) {
  // 记录错误日志
  console.error('邮件处理失败:', error.message);

  // 发送告警
  await sendAlert({
    type: 'email_processing_error',
    error: error.message,
    emailId: emailData.id
  });

  // 将邮件移动到失败文件夹
  await moveToFailedFolder(emailData.id);

  throw error; // 重新抛出错误，触发n8n错误处理
}
```
```

## 最佳实践

### 1. 需求分析技巧

- **明确目标**: 清楚说明工作流的最终目的
- **定义边界**: 明确工作流的处理范围和限制
- **考虑异常**: 想到可能出现的异常情况
- **性能要求**: 说明处理频率和响应时间要求

### 2. 工作流设计原则

- **模块化**: 将复杂流程分解为可复用的模块
- **可维护性**: 使用清晰的节点名称和注释
- **可监控性**: 添加日志记录和状态检查
- **可扩展性**: 设计时考虑未来的功能扩展

### 3. 代码质量

- **错误处理**: 每个代码节点都包含错误处理
- **性能优化**: 避免不必要的循环和计算
- **代码注释**: 添加必要的注释说明
- **测试验证**: 在实际环境中测试代码逻辑

## 常见问题解答

### Q1: 如何处理大量邮件？
A: 可以使用批量处理和队列机制：
```javascript
// 批量处理示例
const batchSize = 10;
const emails = $input.all();

for (let i = 0; i < emails.length; i += batchSize) {
  const batch = emails.slice(i, i + batchSize);
  await processBatch(batch);

  // 避免频率限制，添加延迟
  if (i + batchSize < emails.length) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

### Q2: 如何保护邮箱安全？
A: 建议使用应用专用密码：
- 1. 在邮箱设置中启用两步验证
- 2. 生成应用专用密码
- 3. 在n8n中使用应用专用密码，而不是主密码

### Q3: 工作流执行失败怎么办？
A: 设置完善的错误处理：
- 1. 配置n8n的错误工作流
- 2. 设置告警通知
- 3. 定期检查执行日志
- 4. 建立手动回滚机制

### Q4: 如何监控工作流性能？
A: 使用n8n的内置监控：
- 1. 查看执行历史和统计
- 2. 设置性能告警
- 3. 定期优化慢速节点
- 4. 监控资源使用情况

## 进阶技巧

### 1. 使用环境变量

```javascript
// 使用环境变量配置
const config = {
  emailProvider: process.env.EMAIL_PROVIDER,
  apiKey: process.env.API_KEY,
  webhookUrl: process.env.WEBHOOK_URL
};
```

### 2. 数据验证

```javascript
// 输入数据验证
function validateEmailData(data) {
  const required = ['from', 'subject', 'text'];
  const missing = required.filter(field => !data[field]);

  if (missing.length > 0) {
    throw new Error(`缺少必要字段: ${missing.join(', ')}`);
  }

  return true;
}
```

### 3. 缓存机制

```javascript
// 简单缓存实现
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
```

## 社区支持

- **GitHub仓库**: 报告问题和功能请求
- **用户论坛**: 交流使用经验
- **视频教程**: 观看实战演示
- **文档中心**: 查看详细文档

## 联系我们

如有问题或建议，欢迎联系：
- 技术支持邮箱
- 在线客服
- 用户交流群

---

让n8n智能体构建变得简单有趣！🚀