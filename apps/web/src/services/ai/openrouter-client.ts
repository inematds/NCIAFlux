/**
 * OpenRouter Client - v1.3
 * Client for OpenRouter API (multi-LLM gateway)
 */

import type {
  OpenRouterRequest,
  OpenRouterResponse,
  OpenRouterMessage,
  OpenRouterTool,
  AIModelId,
} from '@shared/types';
import { AI_MODELS } from '@shared/types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterClientConfig {
  apiKey: string;
  defaultModel: AIModelId;
  siteUrl?: string;
  siteName?: string;
}

export class OpenRouterClient {
  private config: OpenRouterClientConfig;

  constructor(config: OpenRouterClientConfig) {
    this.config = config;
  }

  /**
   * Send a chat completion request to OpenRouter
   */
  async chat(params: {
    messages: OpenRouterMessage[];
    model?: AIModelId;
    tools?: OpenRouterTool[];
    stream?: boolean;
    maxTokens?: number;
    temperature?: number;
  }): Promise<OpenRouterResponse> {
    const model = params.model || this.config.defaultModel;

    const request: OpenRouterRequest = {
      model,
      messages: params.messages,
      tools: params.tools,
      tool_choice: params.tools && params.tools.length > 0 ? 'auto' : undefined,
      stream: params.stream || false,
      max_tokens: params.maxTokens || 2048,
      temperature: params.temperature ?? 0.7,
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': this.config.siteUrl || 'https://nciaflux.vercel.app',
        'X-Title': this.config.siteName || 'NCIAFlux - MentesBrilhantes',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new OpenRouterError(
        `OpenRouter API error: ${response.status} ${response.statusText}`,
        response.status,
        errorBody
      );
    }

    return response.json() as Promise<OpenRouterResponse>;
  }

  /**
   * Send a streaming chat completion request
   * Returns a ReadableStream for real-time updates
   */
  async chatStream(params: {
    messages: OpenRouterMessage[];
    model?: AIModelId;
    tools?: OpenRouterTool[];
    maxTokens?: number;
    temperature?: number;
  }): Promise<ReadableStream<Uint8Array> | null> {
    const model = params.model || this.config.defaultModel;

    const request: OpenRouterRequest = {
      model,
      messages: params.messages,
      tools: params.tools,
      tool_choice: params.tools && params.tools.length > 0 ? 'auto' : undefined,
      stream: true,
      max_tokens: params.maxTokens || 2048,
      temperature: params.temperature ?? 0.7,
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': this.config.siteUrl || 'https://nciaflux.vercel.app',
        'X-Title': this.config.siteName || 'NCIAFlux - MentesBrilhantes',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new OpenRouterError(
        `OpenRouter API error: ${response.status} ${response.statusText}`,
        response.status,
        errorBody
      );
    }

    return response.body;
  }

  /**
   * Get available models
   */
  getAvailableModels() {
    return AI_MODELS;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.startsWith('sk-or-');
  }
}

/**
 * Custom error class for OpenRouter errors
 */
export class OpenRouterError extends Error {
  public statusCode: number;
  public body: string;

  constructor(message: string, statusCode: number, body: string) {
    super(message);
    this.name = 'OpenRouterError';
    this.statusCode = statusCode;
    this.body = body;
  }

  isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

/**
 * Create OpenRouter client from environment variables
 */
export function createOpenRouterClient(): OpenRouterClient {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const defaultModel = (process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-3.5-sonnet') as AIModelId;

  return new OpenRouterClient({
    apiKey,
    defaultModel,
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://nciaflux.vercel.app',
    siteName: 'NCIAFlux - MentesBrilhantes',
  });
}

/**
 * Select optimal model based on task type
 */
export function selectModelForTask(
  message: string,
  isCrisisMode: boolean = false
): AIModelId {
  // Crisis mode always uses best model for empathy
  if (isCrisisMode) {
    return 'anthropic/claude-3.5-sonnet';
  }

  // Short messages use faster model
  if (message.length < 50 && !message.includes('?')) {
    return 'anthropic/claude-3-haiku';
  }

  // Messages that seem to need tools
  const toolKeywords = [
    'criar', 'adicionar', 'marcar', 'ativar', 'desativar',
    'buscar', 'listar', 'concluir', 'completar', 'deletar',
    'brain dump', 'tarefa', 'projeto', 'nota', 'check-in',
    'crise', 'modo crise', 'ajuda'
  ];

  const needsTools = toolKeywords.some(k =>
    message.toLowerCase().includes(k)
  );

  if (needsTools) {
    return 'anthropic/claude-3.5-sonnet';
  }

  // Default to balanced model
  return 'anthropic/claude-3.5-sonnet';
}
