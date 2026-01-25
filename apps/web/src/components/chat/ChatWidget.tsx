/**
 * ChatWidget Component - v1.3
 * Floating chat widget for AI assistant
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { MessageCircle, X, Trash2, Sparkles, Zap, ChevronDown, GripHorizontal } from 'lucide-react';
import { useChatWithAI } from '@/hooks/useChatWithAI';
import { useChatStore } from '@/stores/chatStore';
import { userStorage } from '@/lib/storage';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { AIModelId } from '@shared/types';

// Model display info
const MODEL_INFO: Record<AIModelId, { name: string; icon: string; description: string; supportsTools: boolean }> = {
  'anthropic/claude-3.5-sonnet': {
    name: 'Claude 3.5',
    icon: '🧠',
    description: 'Melhor qualidade',
    supportsTools: true,
  },
  'anthropic/claude-3-haiku': {
    name: 'Claude Haiku',
    icon: '⚡',
    description: 'Rapido e economico',
    supportsTools: true,
  },
  'openai/gpt-4o-mini': {
    name: 'GPT-4o Mini',
    icon: '🤖',
    description: 'Rapido e barato',
    supportsTools: true,
  },
  'openai/gpt-5-mini': {
    name: 'GPT-5 Mini',
    icon: '✨',
    description: 'Novo da OpenAI',
    supportsTools: true,
  },
  'mistralai/mistral-small-3.1-24b-instruct:free': {
    name: 'Mistral Small',
    icon: '🌀',
    description: 'Gratuito com tools',
    supportsTools: true,
  },
  'meta-llama/llama-4-maverick:free': {
    name: 'Llama 4',
    icon: '🦙',
    description: 'Gratuito multimodal',
    supportsTools: true,
  },
  'google/gemini-2.5-pro-exp-03-25:free': {
    name: 'Gemini 2.5',
    icon: '💎',
    description: 'Gratuito experimental',
    supportsTools: true,
  },
};

export function ChatWidget() {
  const {
    messages,
    isLoading,
    isOpen,
    error,
    sendMessage,
    clearChat,
    closeChat,
    toggleChat,
  } = useChatWithAI();

  const getRemainingMessages = useChatStore((state) => state.getRemainingMessages);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const setModel = useChatStore((state) => state.setModel);
  const [userPlan, setUserPlan] = useState<'free' | 'team' | 'premium' | 'enterprise'>('free');
  const [showModelSelector, setShowModelSelector] = useState(false);

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const user = userStorage.get();
    if (user) {
      setUserPlan(user.role === 'admin' ? 'premium' : 'free');
    }
  }, []);

  const remainingMessages = getRemainingMessages(userPlan);
  const isLowOnMessages = remainingMessages <= 10;
  const currentModel = MODEL_INFO[selectedModel];

  const handleModelSelect = (modelId: AIModelId) => {
    setModel(modelId);
    setShowModelSelector(false);
  };

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    positionStartRef.current = { ...position };
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setPosition({
        x: positionStartRef.current.x + deltaX,
        y: positionStartRef.current.y + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeChat]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg
          transition-all duration-300 transform hover:scale-105
          ${isOpen ? 'bg-gray-600 rotate-90' : 'bg-purple-600 hover:bg-purple-700'}
          text-white`}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
          </div>
        )}
      </button>

      {/* Chat window */}
      <div
        ref={chatContainerRef}
        className={`fixed z-40 w-96 max-w-[calc(100vw-3rem)]
          bg-white rounded-2xl shadow-2xl border border-gray-200
          ${isDragging ? '' : 'transition-all duration-300'} transform origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
        style={{
          maxHeight: 'calc(100vh - 8rem)',
          bottom: `${96 - position.y}px`,
          right: `${24 - position.x}px`,
        }}
      >
        {/* Header - Draggable */}
        <div
          className={`flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <GripHorizontal className="w-5 h-5 text-white/70" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Assistente IA</h3>
              <div className="flex items-center gap-2">
                <p className="text-xs text-purple-200">MentesBrilhantes</p>
                {/* Rate limit indicator */}
                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
                    isLowOnMessages
                      ? 'bg-red-500/30 text-red-100'
                      : 'bg-white/10 text-purple-200'
                  }`}
                  title={`${remainingMessages} mensagens restantes hoje`}
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>{remainingMessages}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model selector button */}
            <div className="relative">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors text-xs"
                title="Selecionar modelo"
              >
                <span>{currentModel?.icon}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Model selector dropdown */}
              {showModelSelector && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                  {(Object.entries(MODEL_INFO) as [AIModelId, typeof MODEL_INFO[AIModelId]][]).map(([id, info]) => (
                    <button
                      key={id}
                      onClick={() => handleModelSelect(id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                        selectedModel === id ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                      }`}
                    >
                      <span>{info.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{info.name}</p>
                        <p className="text-xs text-gray-500 truncate">{info.description}</p>
                      </div>
                      {selectedModel === id && (
                        <span className="text-purple-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                title="Limpar conversa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={closeChat}
              className="p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{ height: '350px', maxHeight: 'calc(100vh - 16rem)' }}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Ola! Como posso ajudar?</h4>
              <p className="text-sm text-gray-500 mb-4">
                Posso criar tarefas, fazer brain dump, ativar modo crise e muito mais.
              </p>
              <div className="space-y-2 w-full">
                <SuggestionButton
                  onClick={() => sendMessage('O que devo fazer agora?')}
                  text="O que devo fazer agora?"
                />
                <SuggestionButton
                  onClick={() => sendMessage('Me ajude a organizar meu dia')}
                  text="Me ajude a organizar meu dia"
                />
                <SuggestionButton
                  onClick={() => sendMessage('Estou me sentindo sobrecarregado')}
                  text="Estou me sentindo sobrecarregado"
                />
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Input area */}
        <ChatInput
          onSend={(message, isVoice) => sendMessage(message, isVoice ? 'voice' : 'text')}
          isLoading={isLoading}
          placeholder="Digite ou fale sua mensagem..."
        />
      </div>
    </>
  );
}

// Suggestion button component
function SuggestionButton({ onClick, text }: { onClick: () => void; text: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-sm text-left text-purple-700 bg-purple-50
        rounded-lg hover:bg-purple-100 transition-colors"
    >
      {text}
    </button>
  );
}
