export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-textPrimary mb-8">
        Termos de Uso
      </h1>

      <div className="bg-white rounded-2xl shadow-sm p-8 prose prose-neutral max-w-none">
        <p className="text-neutral-textSecondary mb-6">
          Última atualização: Janeiro de 2024
        </p>

        <h2 className="text-xl font-semibold text-neutral-textPrimary mt-8 mb-4">
          1. Aceitação dos Termos
        </h2>
        <p className="text-neutral-textSecondary mb-4">
          Ao utilizar o NCIAFlux, você concorda com estes termos de uso.
          Se não concordar, não utilize nossos serviços.
        </p>

        <h2 className="text-xl font-semibold text-neutral-textPrimary mt-8 mb-4">
          2. Descrição do Serviço
        </h2>
        <p className="text-neutral-textSecondary mb-4">
          O NCIAFlux é uma plataforma de suporte para pessoas com TDAH,
          oferecendo ferramentas de gestão de tarefas, planejamento diário
          e acompanhamento de produtividade.
        </p>

        <h2 className="text-xl font-semibold text-neutral-textPrimary mt-8 mb-4">
          3. Uso Adequado
        </h2>
        <p className="text-neutral-textSecondary mb-4">
          Você concorda em usar o serviço apenas para fins legais e de acordo
          com estes termos. É proibido:
        </p>
        <ul className="list-disc list-inside text-neutral-textSecondary mb-4 space-y-2">
          <li>Usar o serviço para atividades ilegais</li>
          <li>Tentar acessar contas de outros usuários</li>
          <li>Interferir no funcionamento do serviço</li>
          <li>Compartilhar sua conta com terceiros</li>
        </ul>

        <h2 className="text-xl font-semibold text-neutral-textPrimary mt-8 mb-4">
          4. Limitação de Responsabilidade
        </h2>
        <p className="text-neutral-textSecondary mb-4">
          O NCIAFlux é uma ferramenta de apoio e não substitui acompanhamento
          médico ou psicológico profissional. Não nos responsabilizamos por
          decisões tomadas com base nas informações do aplicativo.
        </p>

        <h2 className="text-xl font-semibold text-neutral-textPrimary mt-8 mb-4">
          5. Alterações nos Termos
        </h2>
        <p className="text-neutral-textSecondary mb-4">
          Podemos atualizar estes termos periodicamente. Notificaremos sobre
          mudanças significativas através do aplicativo ou por email.
        </p>

        <h2 className="text-xl font-semibold text-neutral-textPrimary mt-8 mb-4">
          6. Contato
        </h2>
        <p className="text-neutral-textSecondary mb-4">
          Para questões sobre os termos de uso, entre em contato pelo email:
          <a href="mailto:contato@nciaflux.com" className="text-primary-main hover:underline ml-1">
            contato@nciaflux.com
          </a>
        </p>
      </div>
    </div>
  );
}
