import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  ChatMessage,
  MessageRole,
  MessageType,
} from '@nciaflux/shared';

interface LocalMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { id: 'checkin', label: 'Check-in', emoji: '📊' },
  { id: 'help', label: 'Preciso de ajuda', emoji: '🆘' },
  { id: 'celebrate', label: 'Compartilhar vitória', emoji: '🎉' },
  { id: 'tip', label: 'Me dê uma dica', emoji: '💡' },
];

const ASSISTANT_RESPONSES: Record<string, string[]> = {
  checkin: [
    'Ótimo que você quer fazer um check-in! Como está sua energia agora, de 1 a 5?',
    'Vamos ver como você está! Em uma escala de 1 a 5, como está seu nível de foco hoje?',
    'Hora do check-in! Como você descreveria seu humor neste momento?',
  ],
  help: [
    'Estou aqui para ajudar! O que está te travando agora? Vamos resolver juntos.',
    'Sem problemas, vamos encontrar uma solução. Me conta o que está acontecendo?',
    'Respira fundo. Estou aqui. Qual é o maior desafio que você está enfrentando agora?',
  ],
  celebrate: [
    'Que legal que você quer celebrar! Me conta, o que você conquistou? 🎉',
    'Adoro celebrações! Qual foi sua vitória? Pode ser pequena ou grande!',
    'Isso é muito importante! Reconhecer conquistas fortalece nosso cérebro. O que aconteceu de bom?',
  ],
  tip: [
    '💡 Dica: Tente a técnica dos 2 minutos. Se uma tarefa leva menos de 2 minutos, faça agora!',
    '💡 Dica: Quando sentir que está travando, levante e faça 10 polichinelos. Movimento ajuda!',
    '💡 Dica: Divida tarefas grandes em pedaços de 15 minutos. Pequenos passos levam longe.',
    '💡 Dica: Música instrumental ou lo-fi pode ajudar a manter o foco. Quer experimentar?',
    '💡 Dica: Beba água! Desidratação afeta a concentração mais do que pensamos.',
  ],
  default: [
    'Entendi! Como posso te ajudar com isso?',
    'Interessante! Me conta mais sobre isso.',
    'Estou aqui para apoiar você. O que mais você gostaria de compartilhar?',
  ],
  greeting: [
    'Olá! Como você está hoje? Estou aqui para te ajudar no que precisar.',
    'Oi! Que bom te ver por aqui. Como está seu dia?',
    'Ei! Pronto para conquistar o dia? No que posso ajudar?',
  ],
};

const INITIAL_MESSAGES: LocalMessage[] = [
  {
    id: '1',
    role: 'assistant',
    type: 'text',
    content: 'Olá! Sou seu assistente do NeuroFluxo. Estou aqui para te ajudar a navegar pelo seu dia de forma mais leve e produtiva. Como posso te ajudar hoje?',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '2',
    role: 'assistant',
    type: 'suggestion',
    content: 'Dica: Você pode usar os botões abaixo para ações rápidas, ou simplesmente me mandar uma mensagem!',
    timestamp: new Date(Date.now() - 30000),
  },
];

export function ChatScreen() {
  const [messages, setMessages] = useState<LocalMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  function getRandomResponse(category: string): string {
    const responses = ASSISTANT_RESPONSES[category] || ASSISTANT_RESPONSES.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  function addMessage(content: string, role: MessageRole, type: MessageType = 'text') {
    const newMessage: LocalMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }

  function simulateAssistantResponse(category: string = 'default') {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(getRandomResponse(category), 'assistant', 'text');
    }, 1000 + Math.random() * 1000);
  }

  function handleQuickAction(actionId: string) {
    const action = QUICK_ACTIONS.find((a) => a.id === actionId);
    if (action) {
      addMessage(`${action.emoji} ${action.label}`, 'user', 'text');
      simulateAssistantResponse(actionId);
    }
  }

  function handleSendMessage() {
    if (!inputText.trim()) return;

    const message = inputText.trim();
    setInputText('');
    addMessage(message, 'user', 'text');

    // Determine response category based on keywords
    let category = 'default';
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('ola')) {
      category = 'greeting';
    } else if (lowerMessage.includes('ajuda') || lowerMessage.includes('travad') || lowerMessage.includes('difícil')) {
      category = 'help';
    } else if (lowerMessage.includes('consegu') || lowerMessage.includes('fiz') || lowerMessage.includes('vitória')) {
      category = 'celebrate';
    } else if (lowerMessage.includes('dica') || lowerMessage.includes('sugestão')) {
      category = 'tip';
    } else if (lowerMessage.includes('check') || lowerMessage.includes('energia') || lowerMessage.includes('como estou')) {
      category = 'checkin';
    }

    simulateAssistantResponse(category);
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getMessageStyle(message: LocalMessage) {
    if (message.role === 'user') {
      return styles.userMessage;
    }

    switch (message.type) {
      case 'suggestion':
        return styles.suggestionMessage;
      case 'celebration':
        return styles.celebrationMessage;
      case 'check_in':
        return styles.checkInMessage;
      default:
        return styles.assistantMessage;
    }
  }

  function getMessageTextStyle(message: LocalMessage) {
    if (message.role === 'user') {
      return styles.userMessageText;
    }

    switch (message.type) {
      case 'suggestion':
        return styles.suggestionMessageText;
      case 'celebration':
        return styles.celebrationMessageText;
      default:
        return styles.assistantMessageText;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>🤖</Text>
              <View style={styles.onlineIndicator} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Assistente NeuroFluxo</Text>
              <Text style={styles.headerSubtitle}>
                {isTyping ? 'Digitando...' : 'Online'}
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper,
              ]}
            >
              <View style={[styles.messageBubble, getMessageStyle(message)]}>
                <Text style={getMessageTextStyle(message)}>{message.content}</Text>
              </View>
              <Text
                style={[
                  styles.messageTime,
                  message.role === 'user' ? styles.userMessageTime : styles.assistantMessageTime,
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageWrapper, styles.assistantMessageWrapper]}>
              <View style={[styles.messageBubble, styles.assistantMessage]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContent}
          >
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={() => handleQuickAction(action.id)}
              >
                <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={COLORS.neutral.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    fontSize: 32,
    width: 44,
    height: 44,
    textAlign: 'center',
    lineHeight: 44,
    backgroundColor: COLORS.primary.main + '15',
    borderRadius: 22,
    overflow: 'hidden',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent.success,
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.accent.success,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  messageWrapper: {
    marginBottom: SPACING.md,
    maxWidth: '85%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantMessageWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  userMessage: {
    backgroundColor: COLORS.primary.main,
    borderBottomRightRadius: SPACING.xs,
  },
  userMessageText: {
    color: COLORS.primary.contrast,
    fontSize: 15,
    lineHeight: 22,
  },
  assistantMessage: {
    backgroundColor: COLORS.neutral.white,
    borderBottomLeftRadius: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  assistantMessageText: {
    color: COLORS.neutral.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  suggestionMessage: {
    backgroundColor: COLORS.secondary.light + '40',
    borderBottomLeftRadius: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary.main,
  },
  suggestionMessageText: {
    color: COLORS.secondary.dark,
    fontSize: 15,
    lineHeight: 22,
  },
  celebrationMessage: {
    backgroundColor: COLORS.accent.success + '15',
    borderBottomLeftRadius: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent.success,
  },
  celebrationMessageText: {
    color: COLORS.neutral.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  checkInMessage: {
    backgroundColor: COLORS.primary.main + '10',
    borderBottomLeftRadius: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary.main,
  },
  messageTime: {
    fontSize: 11,
    marginTop: SPACING.xs,
  },
  userMessageTime: {
    color: COLORS.neutral.textMuted,
  },
  assistantMessageTime: {
    color: COLORS.neutral.textMuted,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.neutral.textMuted,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  quickActions: {
    backgroundColor: COLORS.neutral.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
    paddingVertical: SPACING.sm,
  },
  quickActionsContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.background,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  quickActionEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  quickActionLabel: {
    fontSize: 14,
    color: COLORS.neutral.textSecondary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    color: COLORS.neutral.textPrimary,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.neutral.border,
  },
  sendButtonText: {
    color: COLORS.primary.contrast,
    fontSize: 20,
  },
});
