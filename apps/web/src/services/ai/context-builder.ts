/**
 * Context Builder - v1.3
 * Builds user context for AI chat system prompt
 */

import type { AIChatContext, OpenRouterMessage } from '@shared/types';

/**
 * Build the system prompt for the AI assistant
 */
export function buildSystemPrompt(context: AIChatContext): string {
  const { user, cognitiveProfile, currentState, todayContext } = context;

  const greeting = getTimeBasedGreeting(todayContext.timeOfDay);
  const moodContext = currentState.mood ? getMoodContext(currentState.mood) : '';
  const energyContext = currentState.energyLevel ? getEnergyContext(currentState.energyLevel) : '';

  return `Voce e o assistente do NCIAFlux (MentesBrilhantes), um app de produtividade para pessoas com TDAH.

## Sobre o Usuario
- Nome: ${user.name}
- Plano: ${user.plan}
${cognitiveProfile ? `- Perfil: ${cognitiveProfile.summary}` : ''}
${cognitiveProfile?.chronotype ? `- Cronotipo: ${cognitiveProfile.chronotype}` : ''}

## Estado Atual
- Horario: ${greeting} (${todayContext.timeOfDay})
- Data: ${todayContext.date} (${todayContext.dayOfWeek})
${currentState.energyLevel ? `- Energia: ${currentState.energyLevel}/5 ${energyContext}` : ''}
${currentState.mood ? `- Humor: ${currentState.mood} ${moodContext}` : ''}
${currentState.isCrisisMode ? '- MODO CRISE ATIVO - seja extremamente gentil e acolhedor' : ''}

## Contexto do Dia
- Tarefas pendentes: ${todayContext.tasksPending} de ${todayContext.tasksTotal}
- Tarefas concluidas: ${todayContext.tasksCompleted}
${todayContext.top1Task ? `- Prioridade #1: ${todayContext.top1Task}` : ''}
${todayContext.brainDumpInbox > 0 ? `- Brain Dump com ${todayContext.brainDumpInbox} itens para triar` : ''}

## Diretrizes de Comportamento

1. **Tom**: Seja sempre gentil, acolhedor e sem julgamentos. Evite cobrar produtividade.

2. **Respostas**: Seja conciso. Use frases curtas. Evite listas longas.

3. **Acoes**: Use as ferramentas disponiveis para executar acoes quando o usuario pedir.
   - Criar tarefas: use create_task
   - Brain dump: use add_to_brain_dump
   - Completar tarefa: use complete_task
   - Modo crise: use activate_crisis_mode
   - Check-in: use record_checkin

4. **Modo Crise**: Se o usuario parecer sobrecarregado ou pedir ajuda urgente, ative o modo crise e seja extra acolhedor.

5. **Celebracoes**: Celebre pequenas vitorias. "Que bom que voce conseguiu!" vale muito.

6. **Perguntas**: Faca uma pergunta por vez. Nao sobrecarregue.

7. **Idioma**: Sempre responda em portugues do Brasil.

8. **Quando nao souber**: Diga "Nao tenho certeza, mas posso ajudar de outra forma?" em vez de inventar.

Lembre-se: voce esta aqui para ajudar, nao para julgar. Cada passo conta.`;
}

/**
 * Get time-based greeting
 */
function getTimeBasedGreeting(timeOfDay: string): string {
  switch (timeOfDay) {
    case 'morning':
      return 'Bom dia';
    case 'afternoon':
      return 'Boa tarde';
    case 'evening':
    case 'night':
      return 'Boa noite';
    default:
      return 'Ola';
  }
}

/**
 * Get context string based on mood
 */
function getMoodContext(mood: string): string {
  switch (mood) {
    case 'great':
      return '(otimo!)';
    case 'good':
      return '(bem)';
    case 'neutral':
      return '(neutro)';
    case 'low':
      return '(precisando de cuidado)';
    case 'bad':
      return '(momento dificil)';
    default:
      return '';
  }
}

/**
 * Get context string based on energy level
 */
function getEnergyContext(energy: number): string {
  if (energy >= 4) return '(alta)';
  if (energy >= 3) return '(moderada)';
  if (energy >= 2) return '(baixa)';
  return '(muito baixa - precisa de descanso)';
}

/**
 * Convert chat history to OpenRouter format
 */
export function buildMessagesForOpenRouter(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): OpenRouterMessage[] {
  return [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];
}

/**
 * Get current time of day
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Get day of week in Portuguese
 */
export function getDayOfWeek(): string {
  const days = [
    'Domingo', 'Segunda-feira', 'Terca-feira',
    'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado'
  ];
  return days[new Date().getDay()];
}

/**
 * Build a minimal context for when full context is not available
 */
export function buildMinimalContext(userId: string, userName: string): AIChatContext {
  const now = new Date();

  return {
    user: {
      id: userId,
      name: userName,
      plan: 'free',
    },
    cognitiveProfile: null,
    currentState: {
      energyLevel: null,
      mood: null,
      isCrisisMode: false,
      lastCheckIn: null,
    },
    todayContext: {
      date: now.toISOString().split('T')[0],
      dayOfWeek: getDayOfWeek(),
      timeOfDay: getTimeOfDay(),
      tasksTotal: 0,
      tasksPending: 0,
      tasksCompleted: 0,
      top1Task: null,
      brainDumpInbox: 0,
    },
    recentMessages: [],
  };
}
