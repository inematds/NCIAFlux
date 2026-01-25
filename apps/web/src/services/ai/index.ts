/**
 * AI Services - v1.3
 * Exports for AI chat integration
 */

export {
  OpenRouterClient,
  OpenRouterError,
  createOpenRouterClient,
  selectModelForTask,
} from './openrouter-client';

export {
  AI_TOOLS,
  TOOL_NAMES,
  executeToolCall,
} from './tools';

export {
  buildSystemPrompt,
  buildMinimalContext,
  buildMessagesForOpenRouter,
  getTimeOfDay,
  getDayOfWeek,
} from './context-builder';
