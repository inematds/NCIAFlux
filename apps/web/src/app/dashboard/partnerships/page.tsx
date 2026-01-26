'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Users,
  MessageCircle,
  Send,
  Copy,
  Check,
  UserPlus,
  Heart,
  Sparkles,
  ArrowLeft,
  MoreVertical,
} from 'lucide-react';
import HelpButton from '@/components/HelpButton';
import { getHelpContent } from '@/lib/help-content';
import {
  generatePartnershipCode,
  acceptPartnershipCode,
  getPartnerships,
  sendDirectMessage,
  getDirectMessages,
  sendEncouragement,
  Partnership,
  DirectMessage,
} from '@/lib/chat-social-service';
import { userStorage } from '@/lib/storage';

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = userStorage.get();

  useEffect(() => {
    loadPartnerships();
  }, []);

  useEffect(() => {
    if (selectedPartnership) {
      loadMessages(selectedPartnership.id);
    }
  }, [selectedPartnership]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadPartnerships() {
    if (!user) return;
    const data = await getPartnerships(user.id);
    setPartnerships(data);
  }

  async function loadMessages(partnershipId: string) {
    const data = await getDirectMessages(partnershipId);
    setMessages(data);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleGenerateCode() {
    if (!user) return;
    setLoading(true);
    const code = await generatePartnershipCode(user.id);
    setInviteCode(code);
    setLoading(false);
  }

  async function handleJoinWithCode() {
    if (!user || !joinCode.trim()) return;
    setLoading(true);
    setError('');

    const result = await acceptPartnershipCode(joinCode.trim(), user.id);

    if (result.success) {
      setShowAddModal(false);
      setJoinCode('');
      loadPartnerships();
    } else {
      setError(result.error || 'Erro ao aceitar convite');
    }
    setLoading(false);
  }

  async function handleSendMessage() {
    if (!selectedPartnership || !user || !newMessage.trim()) return;

    const message = await sendDirectMessage(
      selectedPartnership.id,
      user.id,
      newMessage.trim()
    );

    if (message) {
      setMessages([...messages, message]);
      setNewMessage('');
    }
  }

  async function handleSendEncouragement() {
    if (!selectedPartnership || !user) return;

    const message = await sendEncouragement(selectedPartnership.id, user.id);
    if (message) {
      setMessages([...messages, message]);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activePartnerships = partnerships.filter(p => p.status === 'active');

  return (
    <div className="p-6 lg:p-8 h-[calc(100vh-4rem)]">
      <div className="h-full flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Partners List */}
        <div className={`lg:w-80 flex-shrink-0 ${selectedPartnership ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-2xl shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-neutral-border">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-neutral-textPrimary flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary-main" />
                  Parcerias
                </h1>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-10 h-10 bg-primary-main text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-neutral-textSecondary">
                Conecte-se com parceiros de responsabilidade
              </p>
            </div>

            {/* Partners List */}
            <div className="flex-1 overflow-y-auto p-4">
              {activePartnerships.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary-main/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-primary-main" />
                  </div>
                  <h3 className="font-medium text-neutral-textPrimary mb-2">
                    Nenhum parceiro ainda
                  </h3>
                  <p className="text-sm text-neutral-textSecondary mb-4">
                    Convide alguém para ser seu parceiro de responsabilidade
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-primary-main text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                  >
                    + Adicionar Parceiro
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {activePartnerships.map((partnership) => (
                    <button
                      key={partnership.id}
                      onClick={() => setSelectedPartnership(partnership)}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${
                        selectedPartnership?.id === partnership.id
                          ? 'bg-primary-main/10 border-2 border-primary-main'
                          : 'hover:bg-neutral-background border-2 border-transparent'
                      }`}
                    >
                      <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-primary-main">
                          {partnership.partnerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-neutral-textPrimary">
                          {partnership.partnerName}
                        </p>
                        <p className="text-xs text-neutral-textMuted">
                          {partnership.lastMessageAt
                            ? `Última msg: ${new Date(partnership.lastMessageAt).toLocaleDateString('pt-BR')}`
                            : 'Nenhuma mensagem'}
                        </p>
                      </div>
                      {partnership.unreadCount > 0 && (
                        <span className="w-6 h-6 bg-primary-main text-white text-xs rounded-full flex items-center justify-center">
                          {partnership.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedPartnership ? (
            <div className="bg-white rounded-2xl shadow-sm h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-neutral-border flex items-center gap-4">
                <button
                  onClick={() => setSelectedPartnership(null)}
                  className="lg:hidden p-2 hover:bg-neutral-background rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center">
                  <span className="font-medium text-primary-main">
                    {selectedPartnership.partnerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-neutral-textPrimary">
                    {selectedPartnership.partnerName}
                  </h2>
                  <p className="text-xs text-neutral-textMuted">Parceiro de responsabilidade</p>
                </div>
                <button className="p-2 hover:bg-neutral-background rounded-lg">
                  <MoreVertical className="w-5 h-5 text-neutral-textMuted" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-neutral-textMuted mx-auto mb-4" />
                    <p className="text-neutral-textSecondary">
                      Nenhuma mensagem ainda. Comece a conversa!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl ${
                            isMe
                              ? 'bg-primary-main text-white rounded-br-none'
                              : 'bg-neutral-background text-neutral-textPrimary rounded-bl-none'
                          }`}
                        >
                          {message.messageType === 'encouragement' && (
                            <div className="flex items-center gap-1 mb-1 opacity-80">
                              <Sparkles className="w-3 h-3" />
                              <span className="text-xs">Incentivo</span>
                            </div>
                          )}
                          {message.messageType === 'achievement_share' && (
                            <div className="flex items-center gap-1 mb-1 opacity-80">
                              <span className="text-xs">🏆 Conquista compartilhada</span>
                            </div>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-neutral-textMuted'}`}>
                            {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-neutral-border">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendEncouragement}
                    className="p-3 bg-secondary-main/10 text-secondary-dark rounded-xl hover:bg-secondary-main/20 transition-colors"
                    title="Enviar incentivo"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-primary-main text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm h-full flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-primary-main/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-primary-main" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-textPrimary mb-2">
                  Selecione uma Parceria
                </h2>
                <p className="text-neutral-textSecondary">
                  Escolha um parceiro na lista para começar a conversar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-neutral-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-textPrimary">
                  Adicionar Parceiro
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setInviteCode('');
                    setJoinCode('');
                    setError('');
                  }}
                  className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Generate Code Section */}
              <div>
                <h3 className="font-medium text-neutral-textPrimary mb-3">
                  Convidar alguém
                </h3>
                <p className="text-sm text-neutral-textSecondary mb-4">
                  Gere um código e compartilhe com quem você quer convidar
                </p>

                {inviteCode ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-neutral-background rounded-xl font-mono text-center text-lg">
                      {inviteCode}
                    </div>
                    <button
                      onClick={() => copyToClipboard(inviteCode)}
                      className="p-3 bg-primary-main text-white rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateCode}
                    disabled={loading}
                    className="w-full py-3 bg-primary-main text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Gerando...' : 'Gerar Código de Convite'}
                  </button>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-neutral-textMuted">ou</span>
                </div>
              </div>

              {/* Join with Code Section */}
              <div>
                <h3 className="font-medium text-neutral-textPrimary mb-3">
                  Entrar com código
                </h3>
                <p className="text-sm text-neutral-textSecondary mb-4">
                  Cole o código que você recebeu de alguém
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="CÓDIGO"
                    className="flex-1 px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main font-mono text-center uppercase"
                  />
                  <button
                    onClick={handleJoinWithCode}
                    disabled={loading || !joinCode.trim()}
                    className="px-6 py-3 bg-accent-success text-white rounded-xl font-medium hover:bg-accent-success/90 transition-colors disabled:opacity-50"
                  >
                    Entrar
                  </button>
                </div>

                {error && (
                  <p className="text-sm text-accent-error mt-2">{error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Button */}
      <HelpButton content={getHelpContent('partnerships')} />
    </div>
  );
}
