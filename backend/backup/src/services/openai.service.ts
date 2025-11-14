import OpenAI from 'openai';
import { ChatMessage, SOP, SOPStep, N8nNodeRecommendation } from '../types';
import { OpenAIServiceManager } from './openai.service.manager';

export class OpenAIService {
  private manager: OpenAIServiceManager;

  constructor() {
    this.manager = OpenAIServiceManager.getInstance();
    // 不在构造函数中检查配置，延迟到实际使用时
  }

  private ensureConfigured(): void {
    if (!this.manager.isConfigured()) {
      console.warn('❌ OpenAI API Key not configured. AI features will be disabled.');
      console.warn('🔍 Please check your .env file and ensure OPENAI_API_KEY is set.');
    }
  }

  private getOpenAIClient(): OpenAI {
    const client = this.manager.getOpenAI();
    if (!client) {
      throw new Error('OpenAI client not initialized. Please check your API configuration.');
    }
    return client;
  }

  // 生成系统提示词
  private getSystemPrompt(): string {
    return `你是一个专业的n8n智能体构建助手，专门帮助用户从想法到完整工作流的实现。

你的核心能力：
1. SOP智能共创：帮助用户理清思路，将模糊想法转化为清晰的执行步骤
2. n8n工作流指导：推荐合适的n8n节点，提供详细的配置指导
3. JavaScript代码生成：为代码节点生成可直接使用的代码

工作流程：
1. 首先了解用户的目标和需求
2. 帮助用户制定详细的SOP（标准操作流程）
3. 为每个步骤推荐合适的n8n节点
4. 提供节点配置指导
5. 在需要时生成JavaScript代码

回复要求：
- 使用中文回复
- 语气友好专业
- 一步步引导用户
- 提供具体可执行的建议
- 在推荐n8n节点时，说明理由和配置方法
- 在生成代码时，提供详细说明和使用指导
- **重要：使用Markdown格式进行回复，合理使用标题、列表、粗体、代码块等格式化工具，让内容结构清晰易读**

n8n常用节点类型：
- Trigger nodes: Webhook, Cron, Manual Trigger, Email Trigger
- Action nodes: HTTP Request, Set, Function, Code, IF/Switch
- Data Processing: Merge, Split, Map, Filter
- Integration: Google Sheets, Slack, Notion, Gmail, Discord

记住：你的目标是让n8n工作流构建变得简单有趣！`;
  }

  // 发送聊天消息
  async sendMessage(
    messages: ChatMessage[],
    context?: {
      currentSOP?: SOP;
      stepId?: string;
    }
  ): Promise<string> {
    this.ensureConfigured();

    try {
      const openai = this.getOpenAIClient();

      const systemPrompt = this.getSystemPrompt();

      // 构建上下文信息
      let contextInfo = '';
      if (context?.currentSOP) {
        contextInfo += `\n\n当前SOP信息：\n标题：${context.currentSOP.title}\n描述：${context.currentSOP.description}\n目标：${context.currentSOP.goal}\n步骤数：${context.currentSOP.steps.length}`;
      }
      if (context?.stepId) {
        const step = context.currentSOP?.steps.find(s => s.id === context.stepId);
        if (step) {
          contextInfo += `\n\n当前步骤：\n${step.title}\n${step.description}`;
        }
      }

      const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt + contextInfo,
        },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: openaiMessages,
        max_tokens: 2000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || '抱歉，我无法生成回复。';
    } catch (error: any) {
      console.error('OpenAI API error:', error);

      // 检查是否是配置错误
      if (error.message.includes('not initialized') || error.message.includes('API configuration')) {
        return 'OpenAI API未正确配置。请在backend/.env文件中设置OPENAI_API_KEY来启用AI功能。';
      }

      throw new Error('AI服务暂时不可用，请稍后再试。');
    }
  }

  // 生成SOP建议
  async generateSOP(userInput: string): Promise<{
    title: string;
    description: string;
    goal: string;
    steps: Array<{
      title: string;
      description: string;
      type: string;
    }>;
  }> {
    this.ensureConfigured();

    try {
      const openai = this.getOpenAIClient();

      const prompt = `基于用户的输入，生成一个详细的SOP（标准操作流程）。

用户输入：${userInput}

请以JSON格式返回，包含：
1. title: SOP标题
2. description: SOP描述
3. goal: SOP目标
4. steps: 步骤数组，每个步骤包含title, description, type

步骤类型可以是：trigger（触发）, action（操作）, condition（条件）, data_processing（数据处理）, output（输出）

确保步骤逻辑清晰，可执行性强。`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的SOP设计专家，擅长将用户的想法转化为结构化的执行步骤。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('无法生成SOP建议');
      }

      // 尝试解析JSON
      try {
        return JSON.parse(content);
      } catch (parseError) {
        // 如果JSON解析失败，尝试提取JSON部分
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('生成的SOP格式不正确');
      }
    } catch (error: any) {
      console.error('SOP generation error:', error);

      if (error.message.includes('not initialized') || error.message.includes('API configuration')) {
        throw new Error('OpenAI API未正确配置。请在backend/.env文件中设置OPENAI_API_KEY来启用AI功能。');
      }

      throw new Error('SOP生成失败，请稍后再试。');
    }
  }

  // 推荐n8n节点
  async recommendN8nNode(
    stepDescription: string,
    stepType: string,
    context?: {
      previousNodes?: string[];
      inputData?: any;
      outputData?: any;
    }
  ): Promise<N8nNodeRecommendation> {
    this.ensureConfigured();

    try {
      const openai = this.getOpenAIClient();

      const prompt = `为一个SOP步骤推荐最合适的n8n节点。

步骤描述：${stepDescription}
步骤类型：${stepType}
${context?.previousNodes ? `前置节点：${context.previousNodes.join(', ')}` : ''}
${context?.inputData ? `输入数据：${JSON.stringify(context.inputData)}` : ''}
${context?.outputData ? `期望输出：${JSON.stringify(context.outputData)}` : ''}

请推荐最合适的n8n节点，并返回JSON格式：
{
  "nodeName": "节点名称（如：httpRequest, set, function）",
  "displayName": "节点显示名称",
  "reason": "推荐理由",
  "configuration": {
    "key1": "value1",
    "key2": "value2"
  },
  "connections": ["连接建议"]
}

考虑节点的功能性、易用性和适用性。`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个n8n专家，熟悉所有n8n节点的功能和配置。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('无法生成节点推荐');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('节点推荐格式不正确');
      }
    } catch (error: any) {
      console.error('Node recommendation error:', error);

      if (error.message.includes('not initialized') || error.message.includes('API configuration')) {
        throw new Error('OpenAI API未正确配置。请在backend/.env文件中设置OPENAI_API_KEY来启用AI功能。');
      }

      throw new Error('节点推荐失败，请稍后再试。');
    }
  }

  // 生成JavaScript代码
  async generateJavaScriptCode(
    requirement: string,
    context?: {
      inputData?: any;
      outputData?: any;
      previousCode?: string;
    }
  ): Promise<{
    code: string;
    explanation: string;
    dependencies?: string[];
  }> {
    this.ensureConfigured();

    try {
      const openai = this.getOpenAIClient();

      const prompt = `为n8n的Function或Code节点生成JavaScript代码。

需求：${requirement}
${context?.inputData ? `输入数据结构：${JSON.stringify(context.inputData)}` : ''}
${context?.outputData ? `期望输出数据结构：${JSON.stringify(context.outputData)}` : ''}
${context?.previousCode ? `参考代码：${context.previousCode}` : ''}

请返回JSON格式：
{
  "code": "可执行的JavaScript代码",
  "explanation": "代码说明",
  "dependencies": ["需要的依赖包名称（如果有）"]
}

代码要求：
1. 使用现代JavaScript语法（ES6+）
2. 包含适当的错误处理
3. 添加必要的注释
4. 代码要简洁高效
5. 符合n8n的Function节点格式`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个JavaScript专家，擅长为n8n编写高质量的可执行代码。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.2,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('无法生成代码');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('代码生成格式不正确');
      }
    } catch (error: any) {
      console.error('Code generation error:', error);

      if (error.message.includes('not initialized') || error.message.includes('API configuration')) {
        throw new Error('OpenAI API未正确配置。请在backend/.env文件中设置OPENAI_API_KEY来启用AI功能。');
      }

      throw new Error('代码生成失败，请稍后再试。');
    }
  }
}