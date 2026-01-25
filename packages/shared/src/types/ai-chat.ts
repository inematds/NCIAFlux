/**
 * AI Chat Types - v1.3
 * Types for AI chat integration with OpenRouter
 */

// ===== Message Types =====

export type AIMessageRole = 'user' | 'assistant' | 'system';

export type AIInputType = 'text' | 'voice';

export interface AIMessage {
  id: string;
  sessionId: string;
  role: AIMessageRole;
  content: string;
  toolCalls?: AIToolCall[];
  toolResults?: AIToolResult[];
  metadata: AIMessageMetadata;
  createdAt: string;
}

export interface AIMessageMetadata {
  inputType: AIInputType;
  responseType: 'text' | 'voice';
  latencyMs?: number;
  tokensUsed?: number;
  model?: string;
}

// ===== Tool Types =====

export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface AIToolResult {
  toolCallId: string;
  success: boolean;
  result: unknown;
  error?: string;
}

export interface AITool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// ===== Session Types =====

export interface AIChatSession {
  id: string;
  userId: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  context: AIChatContext;
}

// ===== Context Types =====

export interface AIChatContext {
  user: {
    id: string;
    name: string;
    plan: 'free' | 'team' | 'premium' | 'enterprise';
  };
  cognitiveProfile: {
    summary: string;
    chronotype?: 'morning' | 'evening' | 'variable';
    focusDurationMinutes?: number;
    bestFocusTime?: string;
  } | null;
  currentState: {
    energyLevel: number | null;
    mood: string | null;
    isCrisisMode: boolean;
    lastCheckIn: string | null;
  };
  todayContext: {
    date: string;
    dayOfWeek: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    tasksTotal: number;
    tasksPending: number;
    tasksCompleted: number;
    top1Task: string | null;
    brainDumpInbox: number;
  };
  recentMessages: AIMessage[];
}

// ===== OpenRouter Types =====

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  tools?: OpenRouterTool[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

export interface OpenRouterToolCallResponse {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface OpenRouterChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string | null;
    tool_calls?: OpenRouterToolCallResponse[];
  };
  finish_reason: 'stop' | 'tool_calls' | 'length' | 'content_filter';
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: OpenRouterChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ===== Rate Limiting Types =====

export interface RateLimitConfig {
  messagesPerMinute: number;
  messagesPerHour: number;
  messagesPerDay: number;
  tokensPerDay: number;
}

export interface RateLimitStatus {
  remainingMessages: number;
  remainingTokens: number;
  resetAt: string;
  isLimited: boolean;
}

// ===== Model Configuration =====

export type AIModelId =
  | 'anthropic/claude-3.5-sonnet'
  | 'anthropic/claude-3-haiku'
  | 'openai/gpt-4-turbo'
  | 'mistralai/mistral-large'
  | 'meta-llama/llama-3-70b-instruct';

export interface AIModelConfig {
  id: AIModelId;
  name: string;
  description: string;
  costPer1kInput: number;
  costPer1kOutput: number;
  maxTokens: number;
  supportsTools: boolean;
  recommended: boolean;
}

export const AI_MODELS: Record<string, AIModelConfig> = {
  'anthropic/claude-3.5-sonnet': {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Melhor para conversas empaticas e tool use',
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    maxTokens: 4096,
    supportsTools: true,
    recommended: true,
  },
  'anthropic/claude-3-haiku': {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Rapido e economico para respostas simples',
    costPer1kInput: 0.00025,
    costPer1kOutput: 0.00125,
    maxTokens: 4096,
    supportsTools: true,
    recommended: false,
  },
  'openai/gpt-4-turbo': {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Alternativa poderosa da OpenAI',
    costPer1kInput: 0.01,
    costPer1kOutput: 0.03,
    maxTokens: 4096,
    supportsTools: true,
    recommended: false,
  },
  'mistralai/mistral-large': {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large',
    description: 'Bom custo-beneficio',
    costPer1kInput: 0.004,
    costPer1kOutput: 0.012,
    maxTokens: 4096,
    supportsTools: true,
    recommended: false,
  },
  'meta-llama/llama-3-70b-instruct': {
    id: 'meta-llama/llama-3-70b-instruct',
    name: 'Llama 3 70B',
    description: 'Mais economico, tool use limitado',
    costPer1kInput: 0.0005,
    costPer1kOutput: 0.00075,
    maxTokens: 4096,
    supportsTools: false,
    recommended: false,
  },
};

// ===== Chat Store Types =====

export interface ChatState {
  messages: AIMessage[];
  isLoading: boolean;
  isListening: boolean;
  error: string | null;
  sessionId: string | null;
  selectedModel: AIModelId;
  rateLimitStatus: RateLimitStatus | null;
}

export interface ChatActions {
  sendMessage: (content: string, inputType: AIInputType) => Promise<void>;
  clearMessages: () => void;
  setModel: (model: AIModelId) => void;
  startVoiceInput: () => void;
  stopVoiceInput: () => void;
}
