# Analise Tecnica: Chat com IA para NCIAFlux

**Versao:** 2.0
**Data:** 25 de Janeiro de 2026
**Status:** Proposta
**Feature Targets:**
- **v1.3** - Input (Texto + Voz) via OpenRouter
- **v1.8** - Output (Text-to-Speech)

---

## 1. Visao Geral

Este documento detalha a arquitetura e implementacao do Chat com IA para o NCIAFlux. A feature sera dividida em duas versoes:

- **v1.3 - Chat Input**: Entrada por texto e voz, processamento via OpenRouter (permite escolha de LLM)
- **v1.8 - Voice Output**: Saida por voz (Text-to-Speech) para respostas do assistente

### 1.1 Objetivos

1. **Interacao Natural**: Permitir que usuarios criem, editem e gerenciem tarefas, projetos e notas atraves de conversacao
2. **Consciencia de Contexto**: O chat deve conhecer o estado atual do usuario (energia, humor, cronotipo, tarefas pendentes)
3. **Acoes Automatizadas**: Executar acoes na aplicacao baseadas em comandos de linguagem natural
4. **Flexibilidade de LLM**: OpenRouter permite escolher entre modelos (Claude, GPT, Mistral, etc.)
5. **Suporte Multimodal**: Entrada por texto e voz (v1.3), saida por voz (v1.8)
6. **Privacidade**: Minimizar dados sensiveis enviados para APIs externas

### 1.2 Restricoes e Versoes

| Versao | Escopo | Plano |
|--------|--------|-------|
| **v1.3** | Chat texto + voz INPUT via OpenRouter | Free (limitado) + Premium |
| **v1.8** | Voice OUTPUT (TTS) | Premium |

- Storage atual: localStorage (migracao para Supabase cloud no Premium)
- Framework: Next.js 14 + TypeScript
- Monorepo com Turborepo (apps/web, apps/mobile, packages/shared)

---

## 2. Arquitetura do Chat

### 2.1 Integracao com LLM via OpenRouter

**Estrategia: OpenRouter como Gateway de LLM**

OpenRouter permite acessar multiplos modelos atraves de uma unica API, facilitando:
- **Flexibilidade**: Usuario/admin pode escolher qual modelo usar
- **Fallback**: Se um modelo falhar, pode alternar automaticamente
- **Custo-beneficio**: Escolher modelos mais baratos para tarefas simples
- **Atualizacao**: Novos modelos disponiveis sem mudanca de codigo

| Modelo via OpenRouter | Custo/1M tokens | Tool Use | Recomendacao |
|-----------------------|-----------------|----------|--------------|
| **claude-3.5-sonnet** | ~$3 input / $15 output | Excelente | Default para conversas |
| **gpt-4-turbo** | ~$10 input / $30 output | Excelente | Alternativa |
| **claude-3-haiku** | ~$0.25 input / $1.25 output | Bom | Respostas rapidas/simples |
| **mistral-large** | ~$4 input / $12 output | Bom | Custo-beneficio |
| **llama-3-70b** | ~$0.50 input / $0.75 output | Limitado | Economia maxima |

**Configuracao de Modelos por Uso:**

```typescript
const MODEL_CONFIG = {
  // Conversas complexas com tools
  conversation: 'anthropic/claude-3.5-sonnet',
  // Respostas rapidas e simples
  quick: 'anthropic/claude-3-haiku',
  // Fallback economico
  fallback: 'meta-llama/llama-3-70b-instruct',
};
```

**Vantagens do OpenRouter:**
- Uma API, multiplos modelos
- Precos competitivos com markup minimo (~5%)
- Suporte a streaming
- Tool use compativel com formato OpenAI/Anthropic

### 2.2 Estrutura de Contexto

O chat precisa conhecer o estado completo do usuario para fornecer respostas relevantes:

```typescript
// packages/shared/src/types/ai-chat.ts

interface AIChatContext {
  // Identidade
  user: {
    id: string;
    name: string;
    plan: 'free' | 'team' | 'premium' | 'enterprise';
  };

  // Perfil Cognitivo (da Descoberta)
  cognitiveProfile: {
    summary: string;
    energyPattern: EnergyPattern;
    executionStyle: ExecutionStyle;
    distractionTriggers: DistractionTrigger[];
    copingStrengths: CopingStrength[];
    focusDurationMinutes: number;
    bestFocusTime: string;
  } | null;

  // Estado Atual
  currentState: {
    energyLevel: number | null;  // 1-5, do ultimo check-in
    mood: string | null;
    isCrisisMode: boolean;
    lastCheckIn: string | null;  // ISO timestamp
  };

  // Cronotipo
  chronotype: {
    type: 'morning' | 'evening' | 'variable';
    peakHours: string[];
  } | null;

  // Contexto do Dia
  todayContext: {
    date: string;  // YYYY-MM-DD
    dayOfWeek: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    tasksTotal: number;
    tasksPending: number;
    tasksCompleted: number;
    top1Task: string | null;
    brainDumpInbox: number;
  };

  // Ultimas interacoes (para continuidade)
  recentMessages: ChatMessage[];  // ultimas 10 mensagens
}
```

### 2.3 Gerenciamento de Conversas

```typescript
// packages/shared/src/types/ai-chat.ts

interface ChatSession {
  id: string;
  userId: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  context: AIChatContext;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  metadata: {
    inputType: 'text' | 'voice';
    responseType: 'text' | 'voice';
    latencyMs: number;
    tokensUsed?: number;
  };
  createdAt: string;
}

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

interface ToolResult {
  toolCallId: string;
  success: boolean;
  result: unknown;
  error?: string;
}
```

### 2.4 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cliente (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ ChatWidget   │  │ VoiceInput   │  │ ChatStore (Zustand)  │  │
│  │ (React)      │  │ (Web Speech) │  │ - messages           │  │
│  └──────┬───────┘  └──────┬───────┘  │ - isTyping           │  │
│         │                  │          │ - context            │  │
│         └────────┬─────────┘          │ - selectedModel      │  │
│                  │                    └──────────┬───────────┘  │
│         ┌────────▼───────────────────────────────▼────────┐     │
│         │            useChatWithAI Hook                    │     │
│         │  - sendMessage()                                 │     │
│         │  - startVoiceInput()                             │     │
│         │  - executeToolAction()                           │     │
│         │  - selectModel()                                 │     │
│         └────────────────────┬─────────────────────────────┘     │
└──────────────────────────────┼───────────────────────────────────┘
                               │ POST /api/chat
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  /api/chat/route.ts                                      │    │
│  │  - Valida autenticacao e plano                           │    │
│  │  - Constroi contexto do usuario                          │    │
│  │  - Aplica rate limiting por plano                        │    │
│  │  - Stream response                                       │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────┐    │
│  │  OpenRouterService                                       │    │
│  │  - buildSystemPrompt()                                   │    │
│  │  - callOpenRouter(model)                                 │    │
│  │  - handleToolCalls()                                     │    │
│  │  - selectModelByTask()                                   │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────┐    │
│  │  ToolExecutor                                            │    │
│  │  - createTask()                                          │    │
│  │  - updateTask()                                          │    │
│  │  - createNote()                                          │    │
│  │  - activateCrisisMode()                                  │    │
│  │  - ... (12+ tools)                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OpenRouter API Gateway                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Endpoint: https://openrouter.ai/api/v1/chat/completions   │  │
│  │ Auth: OPENROUTER_API_KEY                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                               │                                  │
│         ┌─────────────────────┼─────────────────────┐           │
│         ▼                     ▼                     ▼           │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   Claude    │     │   GPT-4     │     │  Mistral    │       │
│  │  (Anthropic)│     │  (OpenAI)   │     │   /Llama    │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Interacao com a Aplicacao (Tool Use)

### 3.1 Sistema de Tools

O chat utilizara o pattern de **Tool Use / Function Calling** da Claude API para executar acoes na aplicacao.

```typescript
// apps/web/src/services/ai/tools.ts

export const AI_TOOLS = [
  // === TAREFAS ===
  {
    name: 'create_task',
    description: 'Cria uma nova tarefa para o usuario. Use quando o usuario mencionar algo que precisa fazer.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Titulo da tarefa' },
        description: { type: 'string', description: 'Descricao opcional' },
        priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Prioridade' },
        dueDate: { type: 'string', description: 'Data de vencimento (YYYY-MM-DD)' },
        period: { type: 'string', enum: ['morning', 'afternoon', 'evening'], description: 'Periodo do dia' },
        projectId: { type: 'string', description: 'ID do projeto (opcional)' },
      },
      required: ['title'],
    },
  },

  {
    name: 'update_task',
    description: 'Atualiza uma tarefa existente (status, prioridade, etc)',
    input_schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'ID da tarefa' },
        updates: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'skipped'] },
            priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          },
        },
      },
      required: ['taskId', 'updates'],
    },
  },

  {
    name: 'search_tasks',
    description: 'Busca tarefas por texto, status ou periodo',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texto de busca' },
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'all'] },
        dateRange: { type: 'string', enum: ['today', 'week', 'month', 'all'] },
      },
    },
  },

  {
    name: 'complete_task',
    description: 'Marca uma tarefa como concluida',
    input_schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'ID da tarefa para completar' },
        taskTitle: { type: 'string', description: 'Titulo da tarefa (para buscar se ID nao fornecido)' },
      },
    },
  },

  // === BRAIN DUMP ===
  {
    name: 'add_to_brain_dump',
    description: 'Adiciona um ou mais itens ao Brain Dump do usuario. Use para pensamentos, ideias, coisas para fazer depois.',
    input_schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: { type: 'string' },
              category: { type: 'string', enum: ['call', 'message', 'email', 'plan', 'research', 'create', 'other'] },
            },
            required: ['content'],
          },
        },
      },
      required: ['items'],
    },
  },

  {
    name: 'triage_brain_dump_item',
    description: 'Move um item do Brain Dump para uma categoria de prioridade',
    input_schema: {
      type: 'object',
      properties: {
        itemId: { type: 'string' },
        destination: { type: 'string', enum: ['today', 'week', 'delegate', 'someday', 'done'] },
        setAsTop1: { type: 'boolean', description: 'Se deve marcar como Top 1 prioridade' },
      },
      required: ['itemId', 'destination'],
    },
  },

  // === NOTAS ===
  {
    name: 'create_note',
    description: 'Cria uma nova nota',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        category: { type: 'string' },
        projectId: { type: 'string', description: 'Associar a um projeto (opcional)' },
      },
      required: ['title', 'content'],
    },
  },

  // === PROJETOS ===
  {
    name: 'create_project',
    description: 'Cria um novo projeto',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        emoji: { type: 'string', description: 'Emoji representativo' },
        color: { type: 'string', description: 'Cor hex' },
      },
      required: ['name'],
    },
  },

  {
    name: 'list_projects',
    description: 'Lista todos os projetos do usuario',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },

  // === MODO CRISE ===
  {
    name: 'activate_crisis_mode',
    description: 'Ativa o Modo Crise quando o usuario esta sobrecarregado ou tendo um dia dificil',
    input_schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Motivo opcional (para historico)' },
      },
    },
  },

  {
    name: 'deactivate_crisis_mode',
    description: 'Desativa o Modo Crise',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },

  // === CHECK-IN ===
  {
    name: 'record_checkin',
    description: 'Registra um check-in de energia/humor do usuario',
    input_schema: {
      type: 'object',
      properties: {
        energyLevel: { type: 'number', minimum: 1, maximum: 5 },
        mood: { type: 'string', enum: ['great', 'good', 'neutral', 'low', 'bad'] },
        notes: { type: 'string' },
      },
      required: ['energyLevel'],
    },
  },

  // === CONSULTAS ===
  {
    name: 'get_user_stats',
    description: 'Obtem estatisticas do usuario (tarefas concluidas, check-ins, etc)',
    input_schema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['today', 'week', 'month'] },
      },
    },
  },

  {
    name: 'get_energy_history',
    description: 'Obtem historico de energia/humor do usuario',
    input_schema: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Numero de dias para buscar' },
      },
    },
  },
];
```

### 3.2 Executor de Tools

```typescript
// apps/web/src/services/ai/tool-executor.ts

import { tasksStorage, getStorageKey } from '@/lib/storage';

export class ToolExecutor {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async execute(toolName: string, args: Record<string, unknown>): Promise<ToolResult> {
    try {
      switch (toolName) {
        case 'create_task':
          return await this.createTask(args);
        case 'update_task':
          return await this.updateTask(args);
        case 'complete_task':
          return await this.completeTask(args);
        case 'search_tasks':
          return await this.searchTasks(args);
        case 'add_to_brain_dump':
          return await this.addToBrainDump(args);
        case 'activate_crisis_mode':
          return await this.activateCrisisMode(args);
        case 'record_checkin':
          return await this.recordCheckin(args);
        case 'create_note':
          return await this.createNote(args);
        case 'get_user_stats':
          return await this.getUserStats(args);
        default:
          throw new Error(`Tool nao implementada: ${toolName}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  private async createTask(args: Record<string, unknown>): Promise<ToolResult> {
    const task = {
      id: `task_${Date.now()}`,
      title: args.title as string,
      description: args.description as string | undefined,
      priority: (args.priority as string) || 'medium',
      status: 'pending',
      dueDate: args.dueDate as string || new Date().toISOString().split('T')[0],
      period: args.period as string | undefined,
      projectId: args.projectId as string | undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Salvar no localStorage (ou Supabase para Premium)
    const tasks = tasksStorage.getAll();
    tasks.push(task);
    tasksStorage.setAll(tasks);

    return {
      success: true,
      result: {
        message: `Tarefa "${task.title}" criada com sucesso!`,
        task,
      },
    };
  }

  private async activateCrisisMode(args: Record<string, unknown>): Promise<ToolResult> {
    const crisisKey = getStorageKey('nciaflux_crisis_mode');
    const crisisState = {
      active: true,
      activatedAt: new Date().toISOString(),
      reason: args.reason as string | undefined,
    };

    localStorage.setItem(crisisKey, JSON.stringify(crisisState));

    return {
      success: true,
      result: {
        message: 'Modo Crise ativado. Cuide de voce - estou aqui se precisar.',
        redirectTo: '/dashboard/crisis',
      },
    };
  }

  // ... implementacao das demais tools
}
```

---

## 4. Entrada por Voz

### 4.1 Comparacao de Opcoes

| Tecnologia | Vantagens | Desvantagens | Custo |
|------------|-----------|--------------|-------|
| **Web Speech API** | Gratuito, nativo browser | Precisao variavel, requer internet | Gratuito |
| **OpenAI Whisper** | Alta precisao, multilingue | Latencia maior, custo | $0.006/min |
| **Google Speech-to-Text** | Muito preciso, streaming | Custo, setup complexo | $0.006/15s |
| **Whisper Local** | Gratuito, privacidade | Requer GPU/WASM, latencia | Gratuito |

**Recomendacao (v1.3): Web Speech API + Whisper como fallback**

### 4.2 Implementacao Web Speech API

```typescript
// apps/web/src/hooks/useVoiceInput.ts

import { useState, useCallback, useRef, useEffect } from 'react';

interface VoiceInputResult {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceInput(
  onTranscriptComplete?: (transcript: string) => void
): VoiceInputResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript(prev => prev + final);
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript && onTranscriptComplete) {
        onTranscriptComplete(transcript);
      }
    };

    return () => {
      recognition.stop();
    };
  }, [isSupported, transcript, onTranscriptComplete]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    recognitionRef.current.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
```

### 4.3 Fluxo Voz -> Texto -> LLM -> Resposta

```
1. Usuario clica no botao de microfone
   │
   ▼
2. Web Speech API inicia reconhecimento
   │
   ▼
3. Usuario fala (transcript interim exibido em tempo real)
   │
   ▼
4. Usuario para de falar ou clica para parar
   │
   ▼
5. Transcript final enviado para o hook do chat
   │
   ▼
6. POST /api/chat com { message, inputType: 'voice' }
   │
   ▼
7. Claude processa e retorna resposta (com tools se needed)
   │
   ▼
8. Resposta exibida como texto (ou TTS se configurado)
```

---

## 5. Saida por Voz (Text-to-Speech)

### 5.1 Comparacao de Opcoes

| Tecnologia | Qualidade | Latencia | Custo |
|------------|-----------|----------|-------|
| **Web Speech API** | Media | Baixa | Gratuito |
| **ElevenLabs** | Excelente | Media | $5-22/mes |
| **Google Cloud TTS** | Muito boa | Media | $4/1M chars |
| **Amazon Polly** | Boa | Baixa | $4/1M chars |

**Recomendacao: Web Speech API (v1.8) + ElevenLabs opcional (futuro)**

> **Nota:** A saida por voz (TTS) sera implementada na v1.8. A v1.3 foca apenas no INPUT (texto e voz).

### 5.2 Implementacao TTS

```typescript
// apps/web/src/hooks/useTextToSpeech.ts

import { useState, useCallback, useRef, useEffect } from 'react';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      const ptVoices = voices.filter(v => v.lang.startsWith('pt'));
      setAvailableVoices(ptVoices.length > 0 ? ptVoices : voices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, [isSupported]);

  const speak = useCallback((text: string, options = {}) => {
    if (!isSupported) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;

    const ptVoice = availableVoices.find(v => v.lang.startsWith('pt-BR'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [isSupported, availableVoices]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { isSpeaking, isSupported, availableVoices, speak, stop };
}
```

### 5.3 Quando Usar Voz vs Texto

| Situacao | Resposta Recomendada |
|----------|---------------------|
| Mensagem curta (< 50 chars) | Texto |
| Confirmacao de acao | Texto |
| Resposta longa informativa | Texto + opcao TTS |
| Modo Crise ativo | Voz (mais acolhedor) |
| Usuario enviou por voz | Voz (simetria) |

---

## 6. Seguranca e Privacidade

### 6.1 Dados Enviados para API

**PRINCIPIO: Minimizar dados sensiveis**

**NUNCA enviar para API:**
- Detalhes de historico medico
- Nomes de medicamentos
- Informacoes de terapeutas/profissionais
- Conteudo completo de notas pessoais
- Detalhes de eventos de crise

**Permitido enviar (anonimizado):**
- Resumo do perfil cognitivo
- Nivel de energia atual (1-5)
- Estado de modo crise (boolean)
- Quantidade de tarefas (numeros apenas)
- Titulos de tarefas (se usuario autorizar)

### 6.2 Rate Limiting e Custos

```typescript
const RATE_LIMITS = {
  premium: {
    messagesPerMinute: 10,
    messagesPerHour: 100,
    messagesPerDay: 500,
    voiceMinutesPerDay: 30,
    tokensPerDay: 100000,
  },
};
```

### 6.3 Estimativa de Custos

| Uso | Tokens/mes | Custo Claude Sonnet |
|-----|------------|---------------------|
| Usuario leve (5 msg/dia) | ~50k tokens | ~$0.75/mes |
| Usuario medio (20 msg/dia) | ~200k tokens | ~$3.00/mes |
| Usuario pesado (50 msg/dia) | ~500k tokens | ~$7.50/mes |

**Para 1000 usuarios Premium:** $750 - $7,500/mes

---

## 7. Estrutura de Arquivos

```
apps/web/src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       ├── route.ts           # API endpoint principal
│   │       └── stream/route.ts    # Streaming endpoint
│   └── dashboard/
│       └── chat/
│           └── page.tsx           # Pagina do chat
├── components/
│   └── chat/
│       ├── ChatWidget.tsx         # Componente principal
│       ├── ChatMessage.tsx        # Mensagem individual
│       ├── ChatInput.tsx          # Input texto + voz
│       ├── VoiceButton.tsx        # Botao de microfone
│       ├── QuickActions.tsx       # Acoes rapidas
│       └── TypingIndicator.tsx    # Indicador de digitacao
├── hooks/
│   ├── useChatWithAI.ts           # Hook principal do chat
│   ├── useVoiceInput.ts           # Speech-to-Text
│   ├── useTextToSpeech.ts         # Text-to-Speech
│   └── useChatStore.ts            # Estado Zustand
├── services/
│   └── ai/
│       ├── index.ts               # Export principal
│       ├── claude-client.ts       # Cliente da API Claude
│       ├── context-builder.ts     # Construtor de contexto
│       ├── tool-executor.ts       # Executor de tools
│       ├── tools.ts               # Definicao das tools
│       ├── privacy-filter.ts      # Filtro de privacidade
│       └── response-handler.ts    # Processador de respostas
└── stores/
    └── chatStore.ts               # Estado global do chat
```

---

## 8. Exemplos de Uso

### 8.1 Adicionar Tarefa

**Usuario:** "Adicione 'comprar leite' nas minhas tarefas de hoje"

**Fluxo:**
1. Mensagem enviada para /api/chat
2. Claude identifica intent: criar tarefa
3. Tool call: `create_task({ title: "comprar leite", dueDate: "2026-01-25" })`
4. ToolExecutor cria tarefa no localStorage
5. Claude responde: "Pronto! Adicionei 'comprar leite' para hoje. Quer que eu defina uma prioridade?"

### 8.2 Consultar Sentimentos

**Usuario:** "Como estou me sentindo esta semana?"

**Fluxo:**
1. Tool call: `get_energy_history({ days: 7 })`
2. ToolExecutor busca check-ins dos ultimos 7 dias
3. Claude responde: "Essa semana sua energia variou entre 2 e 4. Terca e quarta foram seus melhores dias."

### 8.3 Ativar Modo Crise

**Usuario:** "Estou muito sobrecarregado, preciso de ajuda"

**Fluxo:**
1. Claude detecta sinais de sobrecarga
2. Tool call: `activate_crisis_mode({ reason: "sobrecarga" })`
3. Claude responde: "Entendi. Ativei o Modo Crise para voce. Respira fundo - esta tudo bem ter dias assim."

### 8.4 Brain Dump por Voz

**Usuario (voz):** "Faz um brain dump: preciso ligar pro banco, enviar email pro chefe, comprar presente da Mae"

**Fluxo:**
1. Web Speech API transcreve audio
2. Tool call: `add_to_brain_dump({ items: [...] })`
3. Claude responde (falado): "Adicionei 3 itens no seu Brain Dump. Quer triar algum deles agora?"

---

## 9. Roadmap de Implementacao

### v1.3 - Chat Input (Texto + Voz)

| Fase | Escopo |
|------|--------|
| **v1.3-alpha** | Chat texto basico via OpenRouter, 5 tools principais |
| **v1.3-beta** | Voice input (Web Speech API), todas 12+ tools |
| **v1.3** | Rate limiting, selecao de modelo, polish UX |

### v1.8 - Voice Output (TTS)

| Fase | Escopo |
|------|--------|
| **v1.8-alpha** | Web Speech API TTS basico |
| **v1.8-beta** | Opcao de vozes, controle de velocidade |
| **v1.8** | ElevenLabs opcional, vozes premium |

### Dependencias entre Versoes

```
v1.2 (atual) → v1.3 (Chat Input) → ... → v1.8 (Voice Output)
                    │
                    └── Requer: OpenRouter API key
                        Storage: localStorage (free) ou Supabase (premium)
```

---

## 10. Metricas de Sucesso

- **Adocao:** 60% dos usuarios Premium usam chat na primeira semana
- **Retencao:** 40% usam chat pelo menos 3x/semana
- **Satisfacao:** NPS > 40 para feature de chat
- **Performance:** Latencia media < 3s para respostas
- **Custo:** < $5/usuario/mes em API calls

---

## 11. Riscos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Custos de API acima do esperado | Alto | Rate limiting agressivo, caching |
| Baixa precisao de voz em PT-BR | Medio | Fallback para Whisper API |
| Respostas inadequadas do LLM | Alto | Guardrails, monitoramento, feedback |
| Latencia alta | Medio | Streaming, otimizacao de contexto |

---

---

## 12. Integracao com OpenRouter

### 12.1 Configuracao

```typescript
// apps/web/src/services/ai/openrouter-client.ts

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterConfig {
  apiKey: string;
  defaultModel: string;
  siteUrl?: string;
  siteName?: string;
}

export class OpenRouterClient {
  private config: OpenRouterConfig;

  constructor(config: OpenRouterConfig) {
    this.config = config;
  }

  async chat(params: {
    messages: Message[];
    model?: string;
    tools?: Tool[];
    stream?: boolean;
  }) {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': this.config.siteUrl || 'https://nciaflux.com',
        'X-Title': this.config.siteName || 'NCIAFlux',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model || this.config.defaultModel,
        messages: params.messages,
        tools: params.tools,
        stream: params.stream || false,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    return params.stream
      ? response.body
      : response.json();
  }
}
```

### 12.2 Selecao Dinamica de Modelo

```typescript
// apps/web/src/services/ai/model-selector.ts

type TaskType = 'simple' | 'complex' | 'crisis' | 'tool_heavy';

const MODEL_MAP: Record<TaskType, string> = {
  simple: 'anthropic/claude-3-haiku',      // Respostas rapidas
  complex: 'anthropic/claude-3.5-sonnet',  // Conversas longas
  crisis: 'anthropic/claude-3.5-sonnet',   // Modo crise (empatia)
  tool_heavy: 'anthropic/claude-3.5-sonnet', // Muitas tools
};

export function selectModelForTask(
  message: string,
  context: ChatContext
): string {
  // Modo crise sempre usa modelo mais empatico
  if (context.currentState.isCrisisMode) {
    return MODEL_MAP.crisis;
  }

  // Mensagens curtas usam modelo rapido
  if (message.length < 50 && !message.includes('?')) {
    return MODEL_MAP.simple;
  }

  // Mensagens que parecem precisar de tools
  const toolKeywords = ['criar', 'adicionar', 'marcar', 'ativar', 'buscar'];
  if (toolKeywords.some(k => message.toLowerCase().includes(k))) {
    return MODEL_MAP.tool_heavy;
  }

  return MODEL_MAP.complex;
}
```

### 12.3 Configuracao de Ambiente

```env
# .env.local

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Modelo padrao
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet

# Rate limits por plano
CHAT_RATE_LIMIT_FREE=10/hora
CHAT_RATE_LIMIT_PREMIUM=100/hora
```

### 12.4 Modelos Recomendados por Caso de Uso

| Caso de Uso | Modelo | Justificativa |
|-------------|--------|---------------|
| **Conversa geral** | claude-3.5-sonnet | Melhor empatia e qualidade |
| **Criar tarefas** | claude-3.5-sonnet | Tool use robusto |
| **Respostas rapidas** | claude-3-haiku | Baixa latencia, economico |
| **Modo Crise** | claude-3.5-sonnet | Maximo cuidado com tom |
| **Brain Dump** | claude-3-haiku | Processamento simples |
| **Fallback** | mistral-large | Quando Claude indisponivel |

---

## 13. Plano Detalhado v1.3 - Chat Input

### 13.1 Epics e Stories

#### Epic 15: Chat com IA (Input)

| Story | Titulo | Descricao | Prioridade |
|-------|--------|-----------|------------|
| 15.1 | Infraestrutura OpenRouter | Configurar cliente OpenRouter, variaveis de ambiente, types | Alta |
| 15.2 | API Route /api/chat | Endpoint para processar mensagens, contexto, streaming | Alta |
| 15.3 | Tool System Base | Implementar 5 tools iniciais (create_task, add_brain_dump, complete_task, activate_crisis, record_checkin) | Alta |
| 15.4 | Chat Widget UI | Componente de chat flutuante, input texto, historico mensagens | Alta |
| 15.5 | Voice Input | Integracao Web Speech API, botao microfone, transcript tempo real | Media |
| 15.6 | Tools Adicionais | Implementar tools restantes (search, notes, projects, stats) | Media |
| 15.7 | Rate Limiting | Controle de uso por plano (free limitado, premium ilimitado) | Media |
| 15.8 | Selecao de Modelo | UI para escolher modelo (admin/premium), selecao automatica | Baixa |

### 13.2 Detalhamento das Stories

#### Story 15.1 - Infraestrutura OpenRouter

**Objetivo:** Configurar integracao basica com OpenRouter API

**Tarefas:**
1. Instalar dependencias necessarias
2. Criar `apps/web/src/services/ai/openrouter-client.ts`
3. Criar types em `packages/shared/src/types/ai-chat.ts`
4. Configurar variaveis de ambiente
5. Criar testes unitarios para o cliente

**Criterios de Aceite:**
- [ ] Cliente OpenRouter funcionando
- [ ] Types exportados do shared package
- [ ] .env.example atualizado
- [ ] Testes passando

---

#### Story 15.2 - API Route /api/chat

**Objetivo:** Criar endpoint para processar mensagens de chat

**Tarefas:**
1. Criar `apps/web/src/app/api/chat/route.ts`
2. Implementar construcao de contexto do usuario
3. Implementar system prompt com persona do assistente
4. Implementar streaming de resposta
5. Adicionar logging basico

**Criterios de Aceite:**
- [ ] POST /api/chat aceita mensagem e retorna resposta
- [ ] Contexto do usuario incluido no prompt
- [ ] Streaming funcionando
- [ ] Erros tratados adequadamente

---

#### Story 15.3 - Tool System Base

**Objetivo:** Implementar primeiras 5 tools para o chat

**Tools:**
1. `create_task` - Criar nova tarefa
2. `add_to_brain_dump` - Adicionar ao brain dump
3. `complete_task` - Marcar tarefa como concluida
4. `activate_crisis_mode` - Ativar modo crise
5. `record_checkin` - Registrar check-in

**Tarefas:**
1. Criar `apps/web/src/services/ai/tools.ts` com definicoes
2. Criar `apps/web/src/services/ai/tool-executor.ts`
3. Integrar executor com API route
4. Testar cada tool individualmente

**Criterios de Aceite:**
- [ ] Cada tool definida corretamente
- [ ] Executor processa tool calls
- [ ] Acoes executadas no localStorage
- [ ] Feedback retornado ao chat

---

#### Story 15.4 - Chat Widget UI

**Objetivo:** Criar interface de chat flutuante

**Componentes:**
- `ChatWidget.tsx` - Container principal (flutuante ou fullscreen)
- `ChatMessage.tsx` - Bolha de mensagem
- `ChatInput.tsx` - Campo de entrada
- `ChatHeader.tsx` - Titulo e controles

**Tarefas:**
1. Criar componentes em `apps/web/src/components/chat/`
2. Criar store Zustand `chatStore.ts`
3. Criar hook `useChatWithAI.ts`
4. Adicionar botao de chat no dashboard
5. Implementar historico de mensagens

**Criterios de Aceite:**
- [ ] Chat abre/fecha suavemente
- [ ] Mensagens exibidas corretamente
- [ ] Scroll automatico para novas mensagens
- [ ] Loading state durante resposta
- [ ] Historico persistido na sessao

---

#### Story 15.5 - Voice Input

**Objetivo:** Permitir entrada por voz via Web Speech API

**Tarefas:**
1. Criar hook `useVoiceInput.ts`
2. Adicionar botao de microfone no ChatInput
3. Exibir transcript em tempo real
4. Enviar transcript final como mensagem
5. Tratar erros e browser nao suportados

**Criterios de Aceite:**
- [ ] Botao de microfone visivel
- [ ] Reconhecimento de voz em PT-BR
- [ ] Transcript exibido em tempo real
- [ ] Mensagem enviada ao parar gravacao
- [ ] Fallback para browsers nao suportados

---

### 13.3 Ordem de Implementacao

```
v1.3-alpha:
  1. Story 15.1 (Infraestrutura)
  2. Story 15.2 (API Route)
  3. Story 15.3 (Tools Base)
  4. Story 15.4 (Chat UI)

v1.3-beta:
  5. Story 15.5 (Voice Input)
  6. Story 15.6 (Tools Adicionais)

v1.3:
  7. Story 15.7 (Rate Limiting)
  8. Story 15.8 (Selecao Modelo)
```

### 13.4 Estimativa de Esforco

| Story | Complexidade | Dependencias |
|-------|--------------|--------------|
| 15.1 | Baixa | Nenhuma |
| 15.2 | Media | 15.1 |
| 15.3 | Media | 15.2 |
| 15.4 | Media | 15.2, 15.3 |
| 15.5 | Media | 15.4 |
| 15.6 | Baixa | 15.3 |
| 15.7 | Baixa | 15.2 |
| 15.8 | Baixa | 15.1, 15.4 |

---

*Documento atualizado em 25/01/2026 para NCIAFlux v1.3 (Chat Input) e v1.8 (Voice Output)*
