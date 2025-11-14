import OpenAI from 'openai';

export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
}

export class OpenAIServiceManager {
  private static instance: OpenAIServiceManager;
  private openai: OpenAI | null = null;
  private config: OpenAIConfig | null = null;
  private isInitialized: boolean = false;
  private initializationAttempted: boolean = false;

  private constructor() {
    // 不在构造函数中加载配置，延迟到第一次使用时
  }

  public static getInstance(): OpenAIServiceManager {
    if (!OpenAIServiceManager.instance) {
      OpenAIServiceManager.instance = new OpenAIServiceManager();
    }
    return OpenAIServiceManager.instance;
  }

  private loadConfig(): void {
    console.log('🔍 OpenAI Service Manager - Loading configuration...');
    console.log('  Process env check:', {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      apiKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) : 'undefined',
      baseURL: process.env.OPENAI_BASE_URL,
      nodeEnv: process.env.NODE_ENV
    });

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.config = {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
      };
      console.log('✅ Configuration loaded successfully');
    } else {
      console.error('❌ Invalid or missing OPENAI_API_KEY');
      this.config = null;
    }
  }

  public initialize(): void {
    if (this.initializationAttempted) {
      console.log('ℹ️ OpenAI service initialization already attempted');
      return;
    }

    this.initializationAttempted = true;

    // 如果配置还未加载，先加载配置
    if (!this.config) {
      this.loadConfig();
    }

    if (!this.config) {
      console.error('❌ Cannot initialize OpenAI: Configuration not loaded');
      return;
    }

    try {
      this.openai = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL
      });

      this.isInitialized = true;
      console.log('✅ OpenAI service initialized successfully');
      console.log(`  Base URL: ${this.config.baseURL}`);
      console.log(`  API Key: ${this.config.apiKey.substring(0, 10)}...`);
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI service:', error);
      this.openai = null;
      this.isInitialized = false;
    }
  }

  public getOpenAI(): OpenAI | null {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.openai;
  }

  public isConfigured(): boolean {
    // 如果还没有加载配置，尝试加载
    if (!this.config && !this.initializationAttempted) {
      this.loadConfig();
    }
    return this.config !== null;
  }

  public getConfig(): OpenAIConfig | null {
    return this.config;
  }

  public reinitialize(): void {
    this.isInitialized = false;
    this.initializationAttempted = false;
    this.openai = null;
    this.loadConfig();
    this.initialize();
  }
}