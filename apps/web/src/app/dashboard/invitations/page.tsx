'use client';

import { useState, useEffect } from 'react';
import { userStorage, invitationsStorage, StoredInvitation } from '@/lib/storage';

export default function InvitationsPage() {
  const [pendingInvitations, setPendingInvitations] = useState<StoredInvitation[]>([]);
  const [respondedInvitations, setRespondedInvitations] = useState<StoredInvitation[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  const user = userStorage.get();

  useEffect(() => {
    loadInvitations();
  }, [user?.email]);

  function loadInvitations() {
    if (!user?.email) return;

    const allInvitations = invitationsStorage.getAll();
    const userInvitations = allInvitations.filter(
      i => i.email.toLowerCase() === user.email.toLowerCase()
    );

    setPendingInvitations(userInvitations.filter(i => i.status === 'pending'));
    setRespondedInvitations(userInvitations.filter(i => i.status !== 'pending'));
  }

  async function handleRespond(invitationId: string, accept: boolean) {
    if (!user?.email) return;

    setProcessing(invitationId);

    // Simulate network delay for demo
    await new Promise(resolve => setTimeout(resolve, 500));

    invitationsStorage.respond(invitationId, accept, user.email);
    loadInvitations();
    setProcessing(null);
  }

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="text-6xl block mb-4">🔒</span>
          <h1 className="text-2xl font-bold text-neutral-textPrimary mb-2">Acesso Restrito</h1>
          <p className="text-neutral-textSecondary">Faca login para ver seus convites.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📧</span>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
            Meus Convites
          </h1>
        </div>
        <p className="text-neutral-textSecondary">
          Gerencie convites para equipes
        </p>
      </div>

      {/* Pending Invitations */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4 flex items-center gap-2">
          <span>📬</span>
          Convites Pendentes
          {pendingInvitations.length > 0 && (
            <span className="px-2 py-0.5 text-sm bg-accent-warning text-white rounded-full">
              {pendingInvitations.length}
            </span>
          )}
        </h2>

        {pendingInvitations.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <span className="text-5xl block mb-4">📭</span>
            <h3 className="text-lg font-semibold text-neutral-textPrimary mb-2">
              Nenhum convite pendente
            </h3>
            <p className="text-neutral-textSecondary">
              Quando voce receber um convite para uma equipe, ele aparecera aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingInvitations.map((invitation) => {
              const isExpired = new Date(invitation.expiresAt) < new Date();
              const isProcessing = processing === invitation.id;

              return (
                <div
                  key={invitation.id}
                  className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${
                    isExpired ? 'border-neutral-textMuted opacity-60' : 'border-primary-main'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        isExpired ? 'bg-neutral-background' : 'bg-primary-main/10'
                      }`}>
                        <span className="text-2xl">👥</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-textPrimary">
                          {invitation.teamName}
                        </h3>
                        <p className="text-neutral-textSecondary">
                          Convite de <span className="font-medium">{invitation.invitedBy}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            invitation.role === 'manager'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {invitation.role === 'manager' ? 'Gestor' : 'Membro'}
                          </span>
                          <span className="text-xs text-neutral-textMuted">
                            Enviado em {new Date(invitation.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          {isExpired ? (
                            <span className="text-xs text-accent-error font-medium">
                              Expirado
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-textMuted">
                              Expira em {new Date(invitation.expiresAt).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isExpired && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleRespond(invitation.id, false)}
                          disabled={isProcessing}
                          className="px-4 py-2 border border-neutral-border rounded-lg text-neutral-textSecondary hover:bg-neutral-background transition-colors disabled:opacity-50"
                        >
                          {isProcessing ? '...' : 'Recusar'}
                        </button>
                        <button
                          onClick={() => handleRespond(invitation.id, true)}
                          disabled={isProcessing}
                          className="px-6 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                        >
                          {isProcessing ? 'Processando...' : 'Aceitar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History */}
      {respondedInvitations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-textPrimary mb-4 flex items-center gap-2">
            <span>📋</span>
            Historico
          </h2>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-neutral-border">
              {respondedInvitations.map((invitation) => {
                const statusConfig: Record<string, { icon: string; color: string; text: string }> = {
                  accepted: { icon: '✅', color: 'text-accent-success', text: 'Aceito' },
                  declined: { icon: '❌', color: 'text-accent-error', text: 'Recusado' },
                  expired: { icon: '⏰', color: 'text-neutral-textMuted', text: 'Expirado' },
                };
                const config = statusConfig[invitation.status] || statusConfig.expired;

                return (
                  <div key={invitation.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{config.icon}</span>
                      <div>
                        <p className="font-medium text-neutral-textPrimary">{invitation.teamName}</p>
                        <p className="text-sm text-neutral-textMuted">
                          {invitation.respondedAt
                            ? new Date(invitation.respondedAt).toLocaleDateString('pt-BR')
                            : new Date(invitation.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color} bg-opacity-10`}>
                      {config.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
