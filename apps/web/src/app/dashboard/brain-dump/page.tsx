'use client';

import { useState, useEffect } from 'react';

interface BrainDumpItem {
  id: string;
  content: string;
  category: string;
  status: 'inbox' | 'today' | 'week' | 'delegate' | 'someday' | 'done';
  isTop1: boolean;
  createdAt: string;
}

const CATEGORIES = [
  { id: 'call', label: 'Ligar', emoji: '📞', color: 'bg-blue-100 text-blue-700' },
  { id: 'message', label: 'Mensagem', emoji: '💬', color: 'bg-green-100 text-green-700' },
  { id: 'email', label: 'E-mail', emoji: '📧', color: 'bg-purple-100 text-purple-700' },
  { id: 'plan', label: 'Planejar', emoji: '📋', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'research', label: 'Pesquisar', emoji: '🔍', color: 'bg-orange-100 text-orange-700' },
  { id: 'create', label: 'Fazer/Criar', emoji: '🛠️', color: 'bg-pink-100 text-pink-700' },
  { id: 'other', label: 'Outros', emoji: '📝', color: 'bg-gray-100 text-gray-700' },
];

export default function BrainDumpPage() {
  const [items, setItems] = useState<BrainDumpItem[]>([]);
  const [bigGoal, setBigGoal] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [viewMode, setViewMode] = useState<'categories' | 'triage'>('categories');
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [itemToTriage, setItemToTriage] = useState<BrainDumpItem | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nciaflux_brain_dump');
    if (saved) {
      const data = JSON.parse(saved);
      setItems(data.items || []);
      setBigGoal(data.bigGoal || '');
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('nciaflux_brain_dump', JSON.stringify({ items, bigGoal }));
  }, [items, bigGoal]);

  function addItem() {
    if (!newItemText.trim()) return;

    const newItem: BrainDumpItem = {
      id: `bd_${Date.now()}`,
      content: newItemText.trim(),
      category: selectedCategory,
      status: 'inbox',
      isTop1: false,
      createdAt: new Date().toISOString(),
    };

    setItems([newItem, ...items]);
    setNewItemText('');
  }

  function deleteItem(id: string) {
    setItems(items.filter(item => item.id !== id));
  }

  function updateItemStatus(id: string, status: BrainDumpItem['status']) {
    setItems(items.map(item =>
      item.id === id ? { ...item, status } : item
    ));
    setShowTriageModal(false);
    setItemToTriage(null);
  }

  function setAsTop1(id: string) {
    setItems(items.map(item => ({
      ...item,
      isTop1: item.id === id,
      status: item.id === id ? 'today' : item.status,
    })));
  }

  function openTriage(item: BrainDumpItem) {
    setItemToTriage(item);
    setShowTriageModal(true);
  }

  const inboxItems = items.filter(i => i.status === 'inbox');
  const todayItems = items.filter(i => i.status === 'today');
  const weekItems = items.filter(i => i.status === 'week');
  const delegateItems = items.filter(i => i.status === 'delegate');
  const top1Item = items.find(i => i.isTop1);

  const getCategoryInfo = (categoryId: string) =>
    CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[6];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
          Brain Dump
        </h1>
        <p className="text-neutral-textSecondary mt-1">
          Despeje tudo da sua cabeca e organize depois
        </p>
      </div>

      {/* Big Goal */}
      <div className="bg-gradient-to-r from-primary-main/10 to-secondary-main/10 rounded-2xl p-5 mb-6">
        <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
          🎯 Meu Grande Objetivo
        </label>
        <input
          type="text"
          value={bigGoal}
          onChange={(e) => setBigGoal(e.target.value)}
          placeholder="Qual e o seu foco principal hoje/semana?"
          className="w-full px-4 py-3 rounded-xl border border-neutral-border bg-white text-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
        />
      </div>

      {/* Top 1 Display */}
      {top1Item && (
        <div className="bg-accent-success/10 border-2 border-accent-success rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⭐</span>
            <span className="font-bold text-accent-success">TOP 1 - Prioridade Absoluta</span>
          </div>
          <p className="text-lg text-neutral-textPrimary">{top1Item.content}</p>
        </div>
      )}

      {/* Quick Add */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder="O que esta na sua cabeca?"
              className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 rounded-xl border border-neutral-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-main"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
            ))}
          </select>
          <button
            onClick={addItem}
            className="px-6 py-3 rounded-xl bg-primary-main text-white font-semibold hover:bg-primary-dark transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Inbox Alert */}
      {inboxItems.length > 10 && (
        <div className="bg-secondary-main/20 border border-secondary-main rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <p className="text-secondary-dark">
            Voce tem <strong>{inboxItems.length} itens</strong> nao triados. Que tal organizar alguns?
          </p>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('categories')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'categories'
              ? 'bg-primary-main text-white'
              : 'bg-white text-neutral-textSecondary hover:bg-neutral-background'
          }`}
        >
          Por Categoria
        </button>
        <button
          onClick={() => setViewMode('triage')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'triage'
              ? 'bg-primary-main text-white'
              : 'bg-white text-neutral-textSecondary hover:bg-neutral-background'
          }`}
        >
          Por Prioridade
        </button>
      </div>

      {viewMode === 'categories' ? (
        /* Categories View */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map(category => {
            const categoryItems = items.filter(i => i.category === category.id && i.status === 'inbox');
            return (
              <div key={category.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{category.emoji}</span>
                  <h3 className="font-semibold text-neutral-textPrimary">{category.label}</h3>
                  <span className="ml-auto bg-neutral-background px-2 py-1 rounded-full text-xs">
                    {categoryItems.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categoryItems.length === 0 ? (
                    <p className="text-sm text-neutral-textMuted text-center py-4">Nenhum item</p>
                  ) : (
                    categoryItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-neutral-background/50 group"
                      >
                        <p className="flex-1 text-sm text-neutral-textPrimary">{item.content}</p>
                        <button
                          onClick={() => openTriage(item)}
                          className="p-1 rounded hover:bg-primary-main/20 text-primary-main opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Triar"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 rounded hover:bg-accent-error/20 text-accent-error opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Excluir"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Triage View */
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Inbox */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📥</span>
              <h3 className="font-semibold text-neutral-textPrimary">Inbox</h3>
              <span className="ml-auto bg-neutral-background px-2 py-1 rounded-full text-xs">
                {inboxItems.length}
              </span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {inboxItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => openTriage(item)}
                  className="p-3 rounded-lg bg-neutral-background/50 cursor-pointer hover:bg-neutral-background transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{getCategoryInfo(item.category).emoji}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryInfo(item.category).color}`}>
                      {getCategoryInfo(item.category).label}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-textPrimary">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Today */}
          <div className="bg-red-50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🔥</span>
              <h3 className="font-semibold text-red-700">Hoje</h3>
              <span className="ml-auto bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                {todayItems.length}/3
              </span>
            </div>
            {todayItems.length >= 3 && (
              <p className="text-xs text-red-600 mb-2">Limite atingido!</p>
            )}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {todayItems.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg ${item.isTop1 ? 'bg-accent-success/20 border-2 border-accent-success' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-2">
                    {item.isTop1 && <span className="text-sm">⭐</span>}
                    <p className="flex-1 text-sm text-neutral-textPrimary">{item.content}</p>
                    {!item.isTop1 && (
                      <button
                        onClick={() => setAsTop1(item.id)}
                        className="text-xs px-2 py-1 rounded bg-primary-main/10 text-primary-main hover:bg-primary-main/20"
                      >
                        Top 1
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Week */}
          <div className="bg-blue-50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📅</span>
              <h3 className="font-semibold text-blue-700">Esta Semana</h3>
              <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                {weekItems.length}/5
              </span>
            </div>
            {weekItems.length >= 5 && (
              <p className="text-xs text-blue-600 mb-2">Limite atingido!</p>
            )}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {weekItems.map(item => (
                <div key={item.id} className="p-3 rounded-lg bg-white">
                  <p className="text-sm text-neutral-textPrimary">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delegate */}
          <div className="bg-purple-50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🤝</span>
              <h3 className="font-semibold text-purple-700">Delegar</h3>
              <span className="ml-auto bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                {delegateItems.length}/3
              </span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {delegateItems.map(item => (
                <div key={item.id} className="p-3 rounded-lg bg-white">
                  <p className="text-sm text-neutral-textPrimary">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Triage Modal */}
      {showTriageModal && itemToTriage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-neutral-textPrimary mb-2">Triar Item</h3>
            <p className="text-neutral-textSecondary mb-4">{itemToTriage.content}</p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setAsTop1(itemToTriage.id);
                  setShowTriageModal(false);
                }}
                className="w-full p-3 rounded-xl bg-accent-success/10 text-accent-success font-medium hover:bg-accent-success/20 transition-colors text-left"
              >
                ⭐ Top 1 - Prioridade Absoluta
              </button>
              <button
                onClick={() => updateItemStatus(itemToTriage.id, 'today')}
                disabled={todayItems.length >= 3 && itemToTriage.status !== 'today'}
                className="w-full p-3 rounded-xl bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors text-left disabled:opacity-50"
              >
                🔥 Hoje (max 3)
              </button>
              <button
                onClick={() => updateItemStatus(itemToTriage.id, 'week')}
                disabled={weekItems.length >= 5 && itemToTriage.status !== 'week'}
                className="w-full p-3 rounded-xl bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors text-left disabled:opacity-50"
              >
                📅 Esta Semana (max 5)
              </button>
              <button
                onClick={() => updateItemStatus(itemToTriage.id, 'delegate')}
                disabled={delegateItems.length >= 3 && itemToTriage.status !== 'delegate'}
                className="w-full p-3 rounded-xl bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition-colors text-left disabled:opacity-50"
              >
                🤝 Delegar/Pedir ajuda (max 3)
              </button>
              <button
                onClick={() => updateItemStatus(itemToTriage.id, 'someday')}
                className="w-full p-3 rounded-xl bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition-colors text-left"
              >
                📦 Algum dia (sem prazo)
              </button>
              <button
                onClick={() => updateItemStatus(itemToTriage.id, 'done')}
                className="w-full p-3 rounded-xl bg-green-50 text-green-700 font-medium hover:bg-green-100 transition-colors text-left"
              >
                ✅ Ja fiz isso!
              </button>
            </div>

            <button
              onClick={() => setShowTriageModal(false)}
              className="w-full mt-4 p-3 rounded-xl border border-neutral-border text-neutral-textSecondary hover:bg-neutral-background transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
