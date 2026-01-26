'use client';

import { useState, useEffect, useRef } from 'react';
import { userStorage, settingsStorage, tasksStorage, getStorageKey } from '@/lib/storage';
import HelpButton from '@/components/HelpButton';
import { getHelpContent } from '@/lib/help-content';

interface UserSettings {
  name: string;
  email: string;
  company: string;
  role: string;
  notifications: {
    email: boolean;
    push: boolean;
    weeklyReport: boolean;
    teamAlerts: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences' | 'team' | 'data'>('profile');
  const [showResetModal, setShowResetModal] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<'tasks' | 'events' | 'notes' | 'backup' | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    name: 'Usuário Demo',
    email: 'demo@nciaflux.com',
    company: 'Empresa Demo',
    role: 'manager',
    notifications: {
      email: true,
      push: true,
      weeklyReport: true,
      teamAlerts: true,
    },
    preferences: {
      theme: 'light',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [avatarInitials, setAvatarInitials] = useState('');

  useEffect(() => {
    // Load user data
    const user = userStorage.get();
    if (user) {
      setSettings((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        company: user.company || prev.company,
        role: user.role || prev.role,
      }));
      setAvatarInitials(user.avatar_url || '');
    }

    // Load saved settings
    const savedSettings = settingsStorage.get();
    if (savedSettings) {
      setSettings((prev) => ({
        ...prev,
        notifications: savedSettings.notifications || prev.notifications,
        preferences: savedSettings.preferences || prev.preferences,
      }));
    }
  }, []);

  function handleSave() {
    setIsSaving(true);
    setSaveMessage('');

    // Save user profile
    const currentUser = userStorage.get();
    if (currentUser) {
      userStorage.set({
        ...currentUser,
        name: settings.name,
        email: settings.email,
        company: settings.company,
        role: settings.role,
      });
    }

    // Save settings (notifications and preferences)
    settingsStorage.set({
      notifications: settings.notifications,
      preferences: settings.preferences,
    });

    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Alterações salvas com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 500);
  }

  const isAdmin = settings.role === 'admin';

  // Admin doesn't have personal features like notifications, team settings, or personal data
  const allTabs = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'notifications', label: 'Notificações', icon: '🔔', hideForAdmin: true },
    { id: 'preferences', label: 'Preferências', icon: '⚙️' },
    { id: 'team', label: 'Equipe', icon: '👥', hideForAdmin: true },
    { id: 'data', label: 'Dados', icon: '🗄️', hideForAdmin: true },
  ];

  const tabs = allTabs.filter(tab => !isAdmin || !tab.hideForAdmin);

  function handleResetData() {
    // Get all keys that start with nciaflux_
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('nciaflux_')) {
        keysToRemove.push(key);
      }
    }

    // Remove all nciaflux keys
    keysToRemove.forEach(key => localStorage.removeItem(key));

    setShowResetModal(false);

    // Redirect to login
    window.location.href = '/login';
  }

  // ===== EXPORT FUNCTIONS =====

  function exportTasks() {
    const tasks = tasksStorage.getAll();
    const csv = [
      'titulo,descricao,prioridade,data,status,categoria',
      ...tasks.map(t =>
        `"${t.title}","${t.description || ''}","${t.priority}","${t.dueDate}","${t.status}","${t.category || ''}"`
      )
    ].join('\n');
    downloadFile(csv, 'tarefas.csv', 'text/csv');
  }

  function exportEvents() {
    const events = JSON.parse(localStorage.getItem(getStorageKey('nciaflux_calendar_events')) || '[]');
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NCIAFlux//MentesBrilhantes//PT',
      ...events.flatMap((e: { id: string; title: string; date: string; startTime?: string; endTime?: string; description?: string }) => [
        'BEGIN:VEVENT',
        `UID:${e.id}@nciaflux`,
        `SUMMARY:${e.title}`,
        `DTSTART:${e.date.replace(/-/g, '')}${e.startTime ? 'T' + e.startTime.replace(':', '') + '00' : ''}`,
        `DTEND:${e.date.replace(/-/g, '')}${e.endTime ? 'T' + e.endTime.replace(':', '') + '00' : ''}`,
        e.description ? `DESCRIPTION:${e.description}` : '',
        'END:VEVENT'
      ].filter(Boolean)),
      'END:VCALENDAR'
    ].join('\r\n');
    downloadFile(icsLines, 'agenda.ics', 'text/calendar');
  }

  function exportNotes() {
    const notes = JSON.parse(localStorage.getItem(getStorageKey('nciaflux_notes')) || '[]');
    const csv = [
      'titulo,conteudo,pasta,tags',
      ...notes.map((n: { title: string; content: string; folderId?: string; tags?: string[] }) =>
        `"${n.title}","${n.content.replace(/"/g, '""')}","${n.folderId || 'inbox'}","${(n.tags || []).join(';')}"`
      )
    ].join('\n');
    downloadFile(csv, 'notas.csv', 'text/csv');
  }

  function exportBackup() {
    const backup: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('nciaflux_')) {
        try {
          backup[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          backup[key] = localStorage.getItem(key);
        }
      }
    }
    const json = JSON.stringify(backup, null, 2);
    downloadFile(json, 'backup-nciaflux.json', 'application/json');
  }

  function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ===== IMPORT FUNCTIONS =====

  function triggerImport(type: 'tasks' | 'events' | 'notes' | 'backup') {
    setImportType(type);
    setImportMessage(null);
    fileInputRef.current?.click();
  }

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !importType) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        switch (importType) {
          case 'tasks':
            importTasks(content);
            break;
          case 'events':
            importEvents(content);
            break;
          case 'notes':
            importNotes(content);
            break;
          case 'backup':
            importBackup(content);
            break;
        }
      } catch (err) {
        setImportMessage({ type: 'error', text: `Erro ao importar: ${err instanceof Error ? err.message : 'Formato invalido'}` });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function importTasks(csv: string) {
    const lines = csv.split('\n').filter(l => l.trim());
    if (lines.length < 2) throw new Error('Arquivo vazio ou sem dados');

    const tasks = tasksStorage.getAll();
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length >= 4) {
        const [titulo, descricao, prioridade, data, status, categoria] = values;
        tasks.push({
          id: `task_import_${Date.now()}_${i}`,
          title: titulo,
          description: descricao || '',
          priority: (['high', 'medium', 'low'].includes(prioridade) ? prioridade : 'medium') as 'high' | 'medium' | 'low',
          dueDate: data || new Date().toISOString().split('T')[0],
          status: (['pending', 'in_progress', 'completed'].includes(status) ? status : 'pending') as 'pending' | 'in_progress' | 'completed',
          category: categoria || 'geral',
          assignee: userStorage.get()?.id || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        imported++;
      }
    }

    tasksStorage.setAll(tasks);
    setImportMessage({ type: 'success', text: `${imported} tarefas importadas com sucesso!` });
    window.dispatchEvent(new CustomEvent('nciaflux-data-refresh', { detail: { type: 'tasks' } }));
  }

  function importEvents(ics: string) {
    const events = JSON.parse(localStorage.getItem(getStorageKey('nciaflux_calendar_events')) || '[]');
    let imported = 0;

    const eventBlocks = ics.split('BEGIN:VEVENT').slice(1);
    for (const block of eventBlocks) {
      const getField = (name: string) => {
        const match = block.match(new RegExp(`${name}:(.+)`));
        return match ? match[1].trim() : '';
      };

      const summary = getField('SUMMARY');
      const dtstart = getField('DTSTART');
      const dtend = getField('DTEND');
      const description = getField('DESCRIPTION');

      if (summary && dtstart) {
        const date = dtstart.slice(0, 8);
        const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

        let startTime = '';
        let endTime = '';
        if (dtstart.includes('T')) {
          const time = dtstart.split('T')[1];
          startTime = `${time.slice(0, 2)}:${time.slice(2, 4)}`;
        }
        if (dtend && dtend.includes('T')) {
          const time = dtend.split('T')[1];
          endTime = `${time.slice(0, 2)}:${time.slice(2, 4)}`;
        }

        events.push({
          id: `event_import_${Date.now()}_${imported}`,
          title: summary,
          date: formattedDate,
          startTime,
          endTime,
          description: description || '',
          createdAt: new Date().toISOString(),
        });
        imported++;
      }
    }

    localStorage.setItem(getStorageKey('nciaflux_calendar_events'), JSON.stringify(events));
    setImportMessage({ type: 'success', text: `${imported} eventos importados com sucesso!` });
    window.dispatchEvent(new CustomEvent('nciaflux-data-refresh', { detail: { type: 'events' } }));
  }

  function importNotes(csv: string) {
    const lines = csv.split('\n').filter(l => l.trim());
    if (lines.length < 2) throw new Error('Arquivo vazio ou sem dados');

    const notes = JSON.parse(localStorage.getItem(getStorageKey('nciaflux_notes')) || '[]');
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length >= 2) {
        const [titulo, conteudo, pasta, tags] = values;
        notes.push({
          id: `note_import_${Date.now()}_${i}`,
          title: titulo || 'Nota importada',
          content: conteudo || '',
          folderId: pasta || 'inbox',
          tags: tags ? tags.split(';').filter(Boolean) : [],
          isPinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        imported++;
      }
    }

    localStorage.setItem(getStorageKey('nciaflux_notes'), JSON.stringify(notes));
    setImportMessage({ type: 'success', text: `${imported} notas importadas com sucesso!` });
    window.dispatchEvent(new CustomEvent('nciaflux-data-refresh', { detail: { type: 'all' } }));
  }

  function importBackup(json: string) {
    const backup = JSON.parse(json);
    let imported = 0;

    for (const [key, value] of Object.entries(backup)) {
      if (key.includes('nciaflux_')) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        imported++;
      }
    }

    setImportMessage({ type: 'success', text: `Backup restaurado! ${imported} itens importados. Recarregando...` });
    setTimeout(() => window.location.reload(), 1500);
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
          Configurações
        </h1>
        <p className="text-neutral-textSecondary mt-1">
          Gerencie sua conta e preferências
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="bg-white rounded-2xl shadow-sm p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-main text-white'
                    : 'text-neutral-textSecondary hover:bg-neutral-background'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-neutral-textPrimary mb-6">
                Informações do Perfil
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-primary-light/20 rounded-full flex items-center justify-center text-2xl font-bold text-primary-main overflow-hidden">
                    {avatarInitials ? (
                      <span className="text-3xl">{avatarInitials}</span>
                    ) : (
                      settings.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                    )}
                  </div>
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
                  >
                    Alterar foto
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={settings.company}
                      onChange={(e) => setSettings({ ...settings, company: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                      Função
                    </label>
                    <select
                      value={settings.role}
                      onChange={(e) => setSettings({ ...settings, role: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
                    >
                      <option value="manager">Gestor / Líder de Equipe</option>
                      <option value="therapist">Terapeuta / Profissional de Saúde</option>
                      <option value="hr">RH / Recursos Humanos</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-border">
                  <h3 className="font-medium text-neutral-textPrimary mb-4">Segurança</h3>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
                  >
                    Alterar senha
                  </button>
                </div>

                {/* Perfil Cognitivo - only for non-admin users */}
                {settings.role !== 'admin' && (
                  <div className="pt-4 border-t border-neutral-border">
                    <h3 className="font-medium text-neutral-textPrimary mb-2">Perfil Cognitivo</h3>
                    <p className="text-sm text-neutral-textMuted mb-4">
                      Refaca o questionario para atualizar seu perfil cognitivo e receber recomendacoes mais precisas.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => window.location.href = '/dashboard/discovery'}
                        className="px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        🧠 Refazer Questionario
                      </button>
                      <button
                        onClick={() => window.location.href = '/dashboard/discovery/result'}
                        className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
                      >
                        📊 Ver Meu Perfil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Password Modal */}
          {showPasswordModal && (
            <PasswordChangeModal
              onClose={() => setShowPasswordModal(false)}
              onSave={(newPassword) => {
                const user = userStorage.get();
                if (user) {
                  userStorage.set({ ...user, password: newPassword });
                }
                setShowPasswordModal(false);
                setSaveMessage('Senha alterada com sucesso!');
                setTimeout(() => setSaveMessage(''), 3000);
              }}
            />
          )}

          {/* Photo Modal */}
          {showPhotoModal && (
            <PhotoChangeModal
              currentAvatar={avatarInitials}
              onClose={() => setShowPhotoModal(false)}
              onSave={(emoji) => {
                setAvatarInitials(emoji);
                const user = userStorage.get();
                if (user) {
                  userStorage.set({ ...user, avatar_url: emoji });
                }
                setShowPhotoModal(false);
                setSaveMessage('Foto alterada com sucesso!');
                setTimeout(() => setSaveMessage(''), 3000);
              }}
            />
          )}

          {activeTab === 'notifications' && !isAdmin && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-neutral-textPrimary mb-6">
                Notificações
              </h2>
              <div className="space-y-4">
                <NotificationToggle
                  label="Notificações por email"
                  description="Receba atualizações importantes por email"
                  enabled={settings.notifications.email}
                  onChange={(v) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, email: v },
                  })}
                />
                <NotificationToggle
                  label="Notificações push"
                  description="Receba alertas em tempo real no navegador"
                  enabled={settings.notifications.push}
                  onChange={(v) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, push: v },
                  })}
                />
                <NotificationToggle
                  label="Relatório semanal"
                  description="Receba um resumo semanal da sua equipe"
                  enabled={settings.notifications.weeklyReport}
                  onChange={(v) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, weeklyReport: v },
                  })}
                />
                <NotificationToggle
                  label="Alertas da equipe"
                  description="Seja notificado sobre check-ins e bloqueios"
                  enabled={settings.notifications.teamAlerts}
                  onChange={(v) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, teamAlerts: v },
                  })}
                />
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-neutral-textPrimary mb-6">
                Preferências
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                    Tema
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 'light', label: 'Claro', icon: '☀️' },
                      { value: 'dark', label: 'Escuro', icon: '🌙' },
                      { value: 'auto', label: 'Automático', icon: '🔄' },
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, theme: theme.value as any },
                        })}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                          settings.preferences.theme === theme.value
                            ? 'border-primary-main bg-primary-main/5'
                            : 'border-neutral-border hover:bg-neutral-background'
                        }`}
                      >
                        <span>{theme.icon}</span>
                        <span className="font-medium">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                    Idioma
                  </label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, language: e.target.value },
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
                    Fuso horário
                  </label>
                  <select
                    value={settings.preferences.timezone}
                    onChange={(e) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, timezone: e.target.value },
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main bg-white"
                  >
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/New_York">New York (GMT-5)</option>
                    <option value="Europe/London">London (GMT+0)</option>
                    <option value="Europe/Paris">Paris (GMT+1)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-neutral-textPrimary mb-6">
                Configurações da Equipe
              </h2>
              <div className="space-y-6">
                <div className="p-4 bg-neutral-background rounded-xl">
                  <h3 className="font-medium text-neutral-textPrimary mb-2">Plano Atual</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary-main">Profissional</p>
                      <p className="text-sm text-neutral-textMuted">Até 25 membros</p>
                    </div>
                    <button className="px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                      Fazer Upgrade
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-neutral-textPrimary mb-4">Permissões Padrão</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-neutral-background rounded-lg">
                      <span className="text-neutral-textSecondary">Novos membros podem ver relatórios</span>
                      <ToggleSwitch enabled={true} onChange={() => {}} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-background rounded-lg">
                      <span className="text-neutral-textSecondary">Membros podem convidar outros</span>
                      <ToggleSwitch enabled={false} onChange={() => {}} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-background rounded-lg">
                      <span className="text-neutral-textSecondary">Check-ins obrigatórios</span>
                      <ToggleSwitch enabled={true} onChange={() => {}} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-border">
                  <button className="text-accent-error hover:underline text-sm">
                    Excluir equipe
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept={importType === 'events' ? '.ics' : importType === 'backup' ? '.json' : '.csv'}
                className="hidden"
              />

              {/* Import message */}
              {importMessage && (
                <div className={`p-4 rounded-xl ${importMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {importMessage.text}
                </div>
              )}

              {/* Import/Export Tarefas */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="font-semibold text-neutral-textPrimary">Tarefas</h3>
                    <p className="text-sm text-neutral-textMuted">Formato CSV (Excel/Google Sheets)</p>
                  </div>
                </div>
                <div className="bg-neutral-background rounded-lg p-3 mb-4">
                  <p className="text-xs font-mono text-neutral-textSecondary mb-2">Formato do arquivo:</p>
                  <code className="text-xs text-neutral-textMuted block">
                    titulo,descricao,prioridade,data,status,categoria<br/>
                    {'"Minha tarefa","Descricao aqui","high","2026-01-28","pending","trabalho"'}
                  </code>
                  <p className="text-xs text-neutral-textMuted mt-2">
                    <strong>prioridade:</strong> high, medium, low | <strong>status:</strong> pending, in_progress, completed
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => triggerImport('tasks')} className="flex-1 px-4 py-2 border border-primary-main text-primary-main rounded-lg hover:bg-primary-main/5 transition-colors">
                    📥 Importar CSV
                  </button>
                  <button onClick={exportTasks} className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors">
                    📤 Exportar CSV
                  </button>
                </div>
              </div>

              {/* Import/Export Eventos */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📅</span>
                  <div>
                    <h3 className="font-semibold text-neutral-textPrimary">Agenda / Eventos</h3>
                    <p className="text-sm text-neutral-textMuted">Formato ICS (Google Calendar, Outlook, Apple)</p>
                  </div>
                </div>
                <div className="bg-neutral-background rounded-lg p-3 mb-4">
                  <p className="text-xs text-neutral-textMuted mb-2">
                    <strong>O que e ICS?</strong> E o formato padrao de calendario. Para exportar do Google Calendar:
                  </p>
                  <ol className="text-xs text-neutral-textMuted list-decimal list-inside space-y-1">
                    <li>Acesse calendar.google.com</li>
                    <li>Clique na engrenagem → Configuracoes</li>
                    <li>Selecione seu calendario → Exportar calendario</li>
                    <li>Baixe o arquivo .ics</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => triggerImport('events')} className="flex-1 px-4 py-2 border border-primary-main text-primary-main rounded-lg hover:bg-primary-main/5 transition-colors">
                    📥 Importar ICS
                  </button>
                  <button onClick={exportEvents} className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors">
                    📤 Exportar ICS
                  </button>
                </div>
              </div>

              {/* Import/Export Notas */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="font-semibold text-neutral-textPrimary">Notas</h3>
                    <p className="text-sm text-neutral-textMuted">Formato CSV (Excel/Google Sheets)</p>
                  </div>
                </div>
                <div className="bg-neutral-background rounded-lg p-3 mb-4">
                  <p className="text-xs font-mono text-neutral-textSecondary mb-2">Formato do arquivo:</p>
                  <code className="text-xs text-neutral-textMuted block">
                    titulo,conteudo,pasta,tags<br/>
                    {'"Minha nota","Conteudo da nota aqui","inbox","tag1;tag2"'}
                  </code>
                  <p className="text-xs text-neutral-textMuted mt-2">
                    <strong>pasta:</strong> inbox, ideas, reference, archive | <strong>tags:</strong> separadas por ;
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => triggerImport('notes')} className="flex-1 px-4 py-2 border border-primary-main text-primary-main rounded-lg hover:bg-primary-main/5 transition-colors">
                    📥 Importar CSV
                  </button>
                  <button onClick={exportNotes} className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors">
                    📤 Exportar CSV
                  </button>
                </div>
              </div>

              {/* Backup Completo */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💾</span>
                  <div>
                    <h3 className="font-semibold text-neutral-textPrimary">Backup Completo</h3>
                    <p className="text-sm text-neutral-textMuted">Formato JSON (todos os dados)</p>
                  </div>
                </div>
                <div className="bg-neutral-background rounded-lg p-3 mb-4">
                  <p className="text-xs text-neutral-textMuted">
                    Exporta <strong>todos</strong> os seus dados em um unico arquivo: tarefas, notas, eventos,
                    check-ins, configuracoes, historico de chat e perfil cognitivo.
                    <br/><br/>
                    Use para fazer backup ou transferir para outro navegador/dispositivo.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => triggerImport('backup')} className="flex-1 px-4 py-2 border border-primary-main text-primary-main rounded-lg hover:bg-primary-main/5 transition-colors">
                    📥 Restaurar Backup
                  </button>
                  <button onClick={exportBackup} className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors">
                    📤 Fazer Backup
                  </button>
                </div>
              </div>

              {/* Zona de Perigo */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="p-4 border-2 border-accent-error/20 bg-accent-error/5 rounded-xl">
                  <h3 className="font-medium text-accent-error mb-2">Zona de Perigo</h3>
                  <p className="text-sm text-neutral-textMuted mb-4">
                    Esta acao ira excluir permanentemente todos os seus dados locais. Voce sera deslogado e precisara criar uma nova conta.
                  </p>
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="px-4 py-2 bg-accent-error text-white rounded-lg font-medium hover:bg-accent-error/90 transition-colors"
                  >
                    🗑️ Excluir todos os dados
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reset Data Modal */}
          {showResetModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl w-full max-w-md">
                <div className="p-6 border-b border-neutral-border">
                  <h2 className="text-xl font-semibold text-accent-error">Confirmar Exclusao</h2>
                </div>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <span className="text-5xl block mb-4">⚠️</span>
                    <p className="text-neutral-textPrimary font-medium mb-2">
                      Tem certeza que deseja excluir todos os dados?
                    </p>
                    <p className="text-sm text-neutral-textMuted">
                      Esta acao nao pode ser desfeita. Todos os seus dados serao perdidos permanentemente.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowResetModal(false)}
                      className="flex-1 px-4 py-3 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleResetData}
                      className="flex-1 px-4 py-3 bg-accent-error text-white rounded-lg font-medium hover:bg-accent-error/90 transition-colors"
                    >
                      Sim, excluir tudo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex items-center justify-end gap-4">
            {saveMessage && (
              <span className="text-accent-success font-medium">{saveMessage}</span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-primary-main text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>

      <HelpButton content={getHelpContent('settings')} />
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-neutral-background rounded-xl">
      <div>
        <p className="font-medium text-neutral-textPrimary">{label}</p>
        <p className="text-sm text-neutral-textMuted">{description}</p>
      </div>
      <ToggleSwitch enabled={enabled} onChange={onChange} />
    </div>
  );
}

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-primary-main' : 'bg-neutral-border'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  );
}

function PasswordChangeModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (password: string) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    onSave(newPassword);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-neutral-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-textPrimary">Alterar Senha</h2>
          <button onClick={onClose} className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-accent-error/10 text-accent-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Senha atual
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-textMuted"
              >
                {showCurrent ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Nova senha
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-textMuted"
              >
                {showNew ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-textSecondary mb-2">
              Confirmar nova senha
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 rounded-lg border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-textMuted"
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Salvar
            </button>
          </div>

          <p className="text-xs text-neutral-textMuted text-center">
            Modo Demo: A senha é salva apenas localmente no navegador.
          </p>
        </form>
      </div>
    </div>
  );
}

function PhotoChangeModal({
  currentAvatar,
  onClose,
  onSave,
}: {
  currentAvatar: string;
  onClose: () => void;
  onSave: (emoji: string) => void;
}) {
  const [selected, setSelected] = useState(currentAvatar);

  const avatarOptions = ['😊', '😎', '🤓', '🧑‍💻', '👨‍💼', '👩‍💼', '🦸', '🧙', '🎨', '🚀', '💼', '🌟', '🔥', '💎', '🎯', '🏆'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-neutral-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-textPrimary">Alterar Foto</h2>
          <button onClick={onClose} className="text-2xl text-neutral-textMuted hover:text-neutral-textPrimary">
            ×
          </button>
        </div>
        <div className="p-6">
          <p className="text-neutral-textSecondary mb-4">
            Escolha um emoji para representar seu perfil:
          </p>

          <div className="grid grid-cols-8 gap-2 mb-6">
            {avatarOptions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelected(emoji)}
                className={`w-10 h-10 text-2xl rounded-lg flex items-center justify-center transition-all ${
                  selected === emoji
                    ? 'bg-primary-main/20 ring-2 ring-primary-main'
                    : 'hover:bg-neutral-background'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-primary-light/20 rounded-full flex items-center justify-center text-4xl">
              {selected || '👤'}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(selected)}
              className="flex-1 px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Salvar
            </button>
          </div>

          <p className="text-xs text-neutral-textMuted text-center mt-4">
            Modo Demo: Em produção, você poderia fazer upload de uma foto real.
          </p>
        </div>
      </div>
    </div>
  );
}
