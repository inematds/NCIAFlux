/**
 * ChatMessage Component - v1.3
 * Individual message bubble in the chat
 */

'use client';

import type { AIMessage } from '@shared/types';

interface ChatMessageProps {
  message: AIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.content.includes('erro:') || message.content.includes('Erro:');

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-purple-600 text-white rounded-br-md'
            : isError
            ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}
      >
        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* Tool calls indicator */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs opacity-70">
              Acoes executadas: {message.toolCalls.map((tc) => tc.name).join(', ')}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className={`mt-1 text-xs ${isUser ? 'text-purple-200' : 'text-gray-400'}`}>
          {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {message.metadata.inputType === 'voice' && ' 🎤'}
        </div>
      </div>
    </div>
  );
}
