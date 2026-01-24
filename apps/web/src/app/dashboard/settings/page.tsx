'use client';

import { useState, useEffect } from 'react';

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
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences' | 'team'>('profile');
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

  useEffect(() => {
    const stored = localStorage.getItem('nciaflux_demo_user');
    if (stored) {
      const user = JSON.parse(stored);
      setSettings((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        company: user.company || prev.company,
        role: user.role || prev.role,
      }));
    }
  }, []);

  function handleSave() {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('nciaflux_demo_user', JSON.stringify({
        id: 'demo-user',
        email: settings.email,
        name: settings.name,
        role: settings.role,
        company: settings.company,
      }));
      setIsSaving(false);
    }, 1000);
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'notifications', label: 'Notificações', icon: '🔔' },
    { id: 'preferences', label: 'Preferências', icon: '⚙️' },
    { id: 'team', label: 'Equipe', icon: '👥' },
  ];

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
                  <div className="w-20 h-20 bg-primary-light/20 rounded-full flex items-center justify-center text-2xl font-bold text-primary-main">
                    {settings.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <button className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors">
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
                  <button className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors">
                    Alterar senha
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
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

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
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
