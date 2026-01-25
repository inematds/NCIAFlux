/**
 * Chat API Route - v1.3
 * POST /api/chat - Process chat messages via OpenRouter
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOpenRouterClient, selectModelForTask } from '@/services/ai/openrouter-client';
import { buildSystemPrompt, buildMinimalContext } from '@/services/ai/context-builder';
import { AI_TOOLS, executeToolCall } from '@/services/ai/tools';
import type {
  AIChatContext,
  AIModelId,
  OpenRouterTool,
} from '@shared/types';
import { AI_MODELS } from '@shared/types';

// Request body type
interface ChatRequest {
  message: string;
  userId: string;
  userName: string;
  context?: Partial<AIChatContext>;
  model?: AIModelId;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

// Response type
interface ChatResponse {
  message: string;
  toolResults?: Array<{
    tool: string;
    success: boolean;
    result: unknown;
    error?: string;
  }>;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, userId, userName, context, model, history = [] } = body;

    // Validate required fields
    if (!message || !userId || !userName) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: message, userId, userName' },
        { status: 400 }
      );
    }

    // Create OpenRouter client
    const client = createOpenRouterClient();

    // Check if API is configured
    if (!client.isConfigured()) {
      return NextResponse.json(
        { error: 'OpenRouter API nao configurada. Verifique OPENROUTER_API_KEY.' },
        { status: 500 }
      );
    }

    // Build context
    const fullContext: AIChatContext = {
      ...buildMinimalContext(userId, userName),
      ...context,
      user: {
        id: userId,
        name: userName,
        plan: context?.user?.plan || 'free',
      },
    };

    // Check for crisis mode indicators in message
    const isCrisisMode = fullContext.currentState.isCrisisMode ||
      checkForCrisisIndicators(message);

    if (isCrisisMode && !fullContext.currentState.isCrisisMode) {
      fullContext.currentState.isCrisisMode = true;
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(fullContext);

    // Select model
    const selectedModel = model || selectModelForTask(message, isCrisisMode);

    // Check if model supports tools
    const modelConfig = AI_MODELS[selectedModel];
    const modelSupportsTools = modelConfig?.supportsTools !== false;

    // Build messages array
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history,
      { role: 'user' as const, content: message },
    ];

    // Convert tools to OpenRouter format (only if model supports them)
    let openRouterTools: OpenRouterTool[] | undefined;
    if (modelSupportsTools) {
      openRouterTools = AI_TOOLS.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.input_schema,
        },
      }));
    }

    // Call OpenRouter
    const response = await client.chat({
      messages,
      model: selectedModel,
      tools: openRouterTools,
      temperature: isCrisisMode ? 0.5 : 0.7, // Lower temperature for crisis mode
    });

    // Process response
    const choice = response.choices[0];
    let assistantMessage = choice.message.content || '';
    const toolResults: ChatResponse['toolResults'] = [];

    // Handle tool calls if any
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      for (const toolCall of choice.message.tool_calls) {
        const toolName = toolCall.function.name;
        let args: Record<string, unknown>;

        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch {
          args = {};
        }

        // Execute tool
        const result = await executeToolCall(
          toolName,
          args,
          userId
        );

        toolResults.push({
          tool: toolName,
          success: result.success,
          result: result.result,
          error: result.error,
        });

        // If tool execution changed something, append to message
        if (result.success && result.message) {
          assistantMessage = result.message;
        }
      }

      // If we had tool calls but no message, make a follow-up call
      if (!assistantMessage && toolResults.length > 0) {
        const toolResultsText = toolResults
          .map(r => r.success
            ? `${r.tool}: sucesso - ${JSON.stringify(r.result)}`
            : `${r.tool}: erro - ${r.error}`)
          .join('\n');

        const followUpMessages = [
          ...messages,
          {
            role: 'assistant' as const,
            content: `[Executei as seguintes acoes:\n${toolResultsText}]`,
          },
          {
            role: 'user' as const,
            content: 'Por favor, me confirme o que voce fez de forma amigavel.',
          },
        ];

        const followUpResponse = await client.chat({
          messages: followUpMessages,
          model: selectedModel,
          temperature: 0.7,
        });

        assistantMessage = followUpResponse.choices[0]?.message.content || 'Pronto! Acao executada.';
      }
    }

    // Build response
    const chatResponse: ChatResponse = {
      message: assistantMessage,
      toolResults: toolResults.length > 0 ? toolResults : undefined,
      model: selectedModel,
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
    };

    return NextResponse.json(chatResponse);

  } catch (error) {
    console.error('Chat API error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);

      if (error.message.includes('401')) {
        return NextResponse.json(
          { error: 'Chave da API invalida. Verifique OPENROUTER_API_KEY.' },
          { status: 401 }
        );
      }
      if (error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Limite de requisicoes atingido. Tente novamente em alguns segundos.' },
          { status: 429 }
        );
      }
      if (error.message.includes('400')) {
        return NextResponse.json(
          { error: 'Requisicao invalida. Verifique os parametros.' },
          { status: 400 }
        );
      }

      // Return more specific error message in development
      return NextResponse.json(
        { error: `Erro: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao processar mensagem. Tente novamente.' },
      { status: 500 }
    );
  }
}

/**
 * Check for crisis indicators in message
 */
function checkForCrisisIndicators(message: string): boolean {
  const crisisKeywords = [
    'crise',
    'ansiedade',
    'panico',
    'nao aguento',
    'demais',
    'sobrecarregado',
    'sobrecarregada',
    'nao consigo',
    'travei',
    'paralisei',
    'paralisia',
    'ajuda urgente',
    'preciso de ajuda',
    'nao sei o que fazer',
    'desespero',
    'desesperad',
  ];

  const lowerMessage = message.toLowerCase();
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
}
