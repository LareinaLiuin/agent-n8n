// SOP相关类型定义
export interface SOPStep {
  id: string;
  title: string;
  description: string;
  type: 'trigger' | 'action' | 'condition' | 'data_processing' | 'output';
  n8nNode?: N8nNodeRecommendation;
  codeSnippet?: string;
  order: number;
}

export interface SOP {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: SOPStep[];
  createdAt: Date;
  updatedAt: Date;
}

// n8n节点相关类型定义
export interface N8nNode {
  name: string;
  displayName: string;
  group: string;
  version: number;
  description: string;
  defaults: Record<string, any>;
  inputs: string[];
  outputs: string[];
  properties: N8nNodeProperty[];
}

export interface N8nNodeRecommendation {
  nodeName: string;
  displayName: string;
  reason: string;
  configuration: Record<string, any>;
  connections?: string[];
}

export interface N8nNodeProperty {
  displayName: string;
  name: string;
  type: string;
  default: any;
  description: string;
  required?: boolean;
  options?: Array<{ name: string; value: any; description: string }>;
}

// 对话相关类型定义
export interface ChatMessage {
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

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  currentSOP?: SOP;
  createdAt: Date;
  updatedAt: Date;
}

// API响应类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 代码生成相关类型
export interface CodeGenerationRequest {
  requirement: string;
  context?: {
    sopId?: string;
    stepId?: string;
    inputData?: any;
    outputData?: any;
  };
}

export interface CodeGenerationResponse {
  code: string;
  explanation: string;
  language: 'javascript' | 'typescript';
  dependencies?: string[];
}

// 工作流验证类型
export interface WorkflowValidationRequest {
  sop: SOP;
  workflowData?: any; // n8n工作流JSON数据
}

export interface WorkflowValidationResponse {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}