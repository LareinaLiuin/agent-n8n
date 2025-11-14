// 简化的类型定义文件
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SOP {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: SOPStep[];
}

export interface SOPStep {
  id: string;
  title: string;
  description: string;
  type: string;
}

export interface N8nNodeRecommendation {
  nodeName: string;
  displayName: string;
  reason: string;
  configuration: Record<string, any>;
  connections: string[];
}