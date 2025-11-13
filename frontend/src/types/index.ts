export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    sopId?: string;
    stepId?: string;
    nodeRecommendation?: any;
    codeSnippet?: string;
  };
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

export interface SOPStep {
  id: string;
  title: string;
  description: string;
  type: 'trigger' | 'action' | 'condition' | 'data_processing' | 'output';
  n8nNode?: any;
  codeSnippet?: string;
  order: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}