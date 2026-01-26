'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Users,
  MessageCircle,
  Send,
  Copy,
  Check,
  Plus,
  ArrowLeft,
  Settings,
  Crown,
  Shield,
  Hash,
} from 'lucide-react';
import HelpButton from '@/components/HelpButton';
import { getHelpContent } from '@/lib/help-content';
import {
  createCommunity,
  joinCommunityWithCode,
  getCommunities,
  sendCommunityMessage,
  getCommunityMessages,
  addReaction,
  Community,
  CommunityMessage,
} from '@/lib/chat-social-service';
import { userStorage } from '@/lib/storage';

const EMOJI_REACTIONS = ['👍', '❤️', '🎉', '🔥', '💪', '🙏'];

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = userStorage.get();

  // Create community form
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    isPublic: true,
    maxMembers: 50,
  });

  useEffect(() => {
    loadCommunities();
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      loadMessages(selectedCommunity.id);
    }
  }, [selectedCommunity]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadCommunities() {
    if (!user) return;
    const data = await getCommunities(user.id);
    setCommunities(data);
  }

  async function loadMessages(communityId: string) {
    const data = await getCommunityMessages(communityId);
    setMessages(data);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleCreateCommunity() {
    if (!user || !newCommunity.name.trim()) return;
    setLoading(true);

    const community = await createCommunity(user.id, {
      name: newCommunity.name.trim(),
      description: newCommunity.description.trim(),
      isPublic: newCommunity.isPublic,
      maxMembers: newCommunity.maxMembers,
    });

    if (community) {
      setShowCreateModal(false);
      setNewCommunity({ name: '', description: '', isPublic: true, maxMembers: 50 });
      loadCommunities();
    }
    setLoading(false);
  }

  async function handleJoinCommunity() {
    if (!user || !joinCode.trim()) return;
    setLoading(true);
    setError('');

    const result = await joinCommunityWithCode(joinCode.trim(), user.id);

    if (result.success) {
      setShowJoinModal(false);
      setJoinCode('');
      loadCommunities();
    } else {
      setError(result.error || 'Erro ao entrar na comunidade');
    }
    setLoading(false);
  }

  async function handleSendMessage() {
    if (!selectedCommunity || !user || !newMessage.trim()) return;

    const message = await sendCommunityMessage(
      selectedCommunity.id,
      user.id,
      user.name,
      newMessage.trim()
    );

    if (message) {
      setMessages([...messages, message]);
      setNewMessage('');
    }
  }

  async function handleReaction(messageId: string, emoji: string) {
    if (!user) return;
    await addReaction(messageId, emoji, user.id);
    // Reload messages to get updated reactions
    if (selectedCommunity) {
      loadMessages(selectedCommunity.id);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getRoleIcon(role?: string) {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-secondary-main" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-accent-info" />;
      default:
        return null;
    }
  }

  return (
    <div className="p-6 lg:p-8 h-[calc(100vh-4rem)]">
      <div className="h-full flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Communities List */}
        <div className={`lg:w-80 flex-shrink-0 ${selectedCommunity ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-2xl shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-neutral-border">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-neutral-textPrimary flex items-center gap-2">
                  <Hash className="w-6 h-6 text-primary-main" />
                  Comunidades
                </h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex-1 py-2 bg-primary-main text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Criar
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex-1 py-2 border border-neutral-border text-neutral-textSecondary rounded-lg text-sm font-medium hover:bg-neutral-background transition-colors"
                >
                  Entrar
                </button>
              </div>
            </div>

            {/* Communities List */}
            <div className="flex-1 overflow-y-auto p-4">
              {communities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary-main/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary-main" />
                  </div>
                  <h3 className="font-medium text-neutral-textPrimary mb-2">
                    Nenhuma comunidade
                  </h3>
                  <p className="text-sm text-neutral-textSecondary">
                    Crie ou entre em uma comunidade para começar
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {communities.map((community) => (
                    <button
                      key={community.id}
                      onClick={() => setSelectedCommunity(community)}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${
                        selectedCommunity?.id === community.id
                          ? 'bg-primary-main/10 border-2 border-primary-main'
                          : 'hover:bg-neutral-background border-2 border-transparent'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-main to-primary-light rounded-xl flex items-center justify-center">
                        <Hash className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-neutral-textPrimary">
                            {community.name}
                          </p>
                          {getRoleIcon(community.myRole)}
                        </div>
                        <p className="text-xs text-neutral-textMuted">
                          {community.memberCount} membros
                        </p>
                      </div>
                      {community.unreadCount > 0 && (
                        <span className="w-6 h-6 bg-primary-main text-white text-xs rounded-full flex items-center justify-center">
                          {community.unreadCount}
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
          {selectedCommunity ? (
            <div className="bg-white rounded-2xl shadow-sm h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-neutral-border flex items-center gap-4">
                <button
                  onClick={() => setSelectedCommunity(null)}
                  className="lg:hidden p-2 hover:bg-neutral-background rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-primary-main to-primary-light rounded-xl flex items-center justify-center">
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-neutral-textPrimary">
                    {selectedCommunity.name}
                  </h2>
                  <p className="text-xs text-neutral-textMuted">
                    {selectedCommunity.memberCount} membros
                  </p>
                </div>
                {selectedCommunity.myRole === 'admin' && (
                  <button className="p-2 hover:bg-neutral-background rounded-lg">
                    <Settings className="w-5 h-5 text-neutral-textMuted" />
                  </button>
                )}
              </div>

              {/* Community Info */}
              {selectedCommunity.description && (
                <div className="px-4 py-3 bg-neutral-background/50 border-b border-neutral-border">
                  <p className="text-sm text-neutral-textSecondary">
                    {selectedCommunity.description}
                  </p>
                </div>
              )}

              {/* Invite Code */}
              {selectedCommunity.inviteCode && (selectedCommunity.myRole === 'admin' || selectedCommunity.myRole === 'moderator') && (
                <div className="px-4 py-2 bg-primary-main/5 border-b border-neutral-border flex items-center justify-between">
                  <span className="text-sm text-neutral-textSecondary">
                    Código: <span className="font-mono font-medium">{selectedCommunity.inviteCode}</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedCommunity.inviteCode!)}
                    className="text-primary-main hover:text-primary-dark"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-neutral-textMuted mx-auto mb-4" />
                    <p className="text-neutral-textSecondary">
                      Nenhuma mensagem ainda. Seja o primeiro!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.senderId === user?.id;
                    return (
                      <div key={message.id} className="group">
                        <div className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <div className="w-8 h-8 bg-primary-light/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-primary-main">
                              {message.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div className={`flex-1 ${isMe ? 'text-right' : ''}`}>
                            <div className={`inline-block max-w-[80%] ${isMe ? 'text-left' : ''}`}>
                              <p className="text-xs text-neutral-textMuted mb-1">
                                {message.senderName}
                              </p>
                              <div
                                className={`p-3 rounded-2xl ${
                                  isMe
                                    ? 'bg-primary-main text-white rounded-tr-none'
                                    : 'bg-neutral-background text-neutral-textPrimary rounded-tl-none'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>

                              {/* Reactions */}
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {Object.entries(message.reactions || {}).map(([emoji, users]) => (
                                  users.length > 0 && (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReaction(message.id, emoji)}
                                      className={`text-xs px-2 py-0.5 rounded-full ${
                                        users.includes(user?.id || '')
                                          ? 'bg-primary-main/20 text-primary-main'
                                          : 'bg-neutral-background text-neutral-textSecondary'
                                      }`}
                                    >
                                      {emoji} {users.length}
                                    </button>
                                  )
                                ))}

                                {/* Add reaction button */}
                                <div className="relative group/reaction">
                                  <button className="text-xs px-2 py-0.5 rounded-full bg-neutral-background text-neutral-textMuted opacity-0 group-hover:opacity-100 transition-opacity">
                                    +
                                  </button>
                                  <div className="absolute bottom-full left-0 mb-1 hidden group-hover/reaction:flex bg-white rounded-lg shadow-lg p-1 gap-1">
                                    {EMOJI_REACTIONS.map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={() => handleReaction(message.id, emoji)}
                                        className="w-8 h-8 hover:bg-neutral-background rounded flex items-center justify-center"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-neutral-textMuted mt-1">
                                {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
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
                  <Hash className="w-10 h-10 text-primary-main" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-textPrimary mb-2">
                  Selecione uma Comunidade
                </h2>
                <p className="text-neutral-textSecondary">
                  Escolha uma comunidade na lista para ver as mensagens
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-neutral-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-textPrimary">
                  Criar Comunidade
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                  Nome da Comunidade
                </label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  placeholder="Ex: TDAH Brasil"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                  Descrição
                </label>
                <textarea
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  placeholder="Sobre o que é essa comunidade?"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                  Limite de membros
                </label>
                <select
                  value={newCommunity.maxMembers}
                  onChange={(e) => setNewCommunity({ ...newCommunity, maxMembers: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
                >
                  <option value={20}>20 membros</option>
                  <option value={50}>50 membros</option>
                  <option value={100}>100 membros</option>
                  <option value={200}>200 membros</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCommunity}
                  disabled={loading || !newCommunity.name.trim()}
                  className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Community Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-neutral-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-textPrimary">
                  Entrar em Comunidade
                </h2>
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                    setError('');
                  }}
                  className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-neutral-textSecondary">
                Digite o código de convite que você recebeu
              </p>

              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                className="w-full px-4 py-3 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main font-mono text-center uppercase text-lg"
              />

              {error && (
                <p className="text-sm text-accent-error">{error}</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleJoinCommunity}
                  disabled={loading || !joinCode.trim()}
                  className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Button */}
      <HelpButton content={getHelpContent('communities')} />
    </div>
  );
}
