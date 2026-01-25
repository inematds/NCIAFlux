/**
 * ChatInput Component - v1.3
 * Text input and voice button for chat
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition?: new () => SpeechRecognitionInterface;
  }
}

interface ChatInputProps {
  onSend: (message: string, isVoice?: boolean) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = 'Digite sua mensagem...' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);

  // Check if speech recognition is supported
  const isSpeechSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSpeechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    recognitionRef.current = new SpeechRecognition();

    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setMessage((prev) => prev + finalTranscript);
        setTranscript('');
      } else {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognition.stop();
    };
  }, [isSpeechSupported]);

  // Handle send message
  const handleSend = () => {
    const text = message.trim();
    if (!text || isLoading) return;

    onSend(text, false);
    setMessage('');
    setTranscript('');

    // Focus input after sending
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle voice input
  const toggleVoice = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);

      // Send accumulated message
      const text = message.trim();
      if (text) {
        onSend(text, true);
        setMessage('');
        setTranscript('');
      }
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 p-3 bg-white">
      {/* Voice transcript indicator */}
      {transcript && (
        <div className="mb-2 px-3 py-1.5 bg-purple-50 rounded-lg text-sm text-purple-700 animate-pulse">
          {transcript}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isListening ? 'Ouvindo...' : placeholder}
            disabled={isLoading}
            rows={1}
            className={`w-full resize-none rounded-xl border px-4 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              disabled:bg-gray-50 disabled:cursor-not-allowed
              ${isListening ? 'border-purple-400 bg-purple-50' : 'border-gray-200'}`}
          />
        </div>

        {/* Voice button */}
        {isSpeechSupported && (
          <button
            onClick={toggleVoice}
            disabled={isLoading}
            className={`p-2.5 rounded-xl transition-colors ${
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isListening ? 'Parar gravacao' : 'Gravar voz'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className="p-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Enviar mensagem"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Voice hint */}
      {isListening && (
        <p className="mt-2 text-xs text-center text-purple-600">
          Fale sua mensagem... Clique no microfone para enviar
        </p>
      )}
    </div>
  );
}
