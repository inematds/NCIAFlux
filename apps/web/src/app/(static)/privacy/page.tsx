export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-textPrimary mb-8">
        Política de Privacidade
      </h1>

      <div className="bg-white rounded-2xl shadow-sm p-8 prose prose-neutral max-w-none">
        <p className="text-neutral-textSecondary mb-6">
          Última atualização: Janeiro de 2024
        </p>

        <h2 className="text-xl font-semibold text-neutral-textPrimary mt-8 mb-4">
          1. Informações que Coletamos
        </h2>
        <p className="text-neutral-textSecondary mb-4">
          Coletamos informações que você nos fornece diretamente, como nome, email,
          e dados relacionados ao uso do aplicativo para suporte ao TDAH.
        </p>

        <h2 className="text-xl font-semibold text-neutral-textPrimary mt-8 mb-4">
          2. Como Usamos suas Informações
        </h2>
        <p className="text-neutral-textSecondary mb-4">
          Utilizamos suas informações para:
        </p>
        <ul className="list-disc list-inside text-neutral-textSecondary mb-4 space-y-2">
          <li>Fornecer e manter nossos serviços</li>
          <li>Personalizar sua experiência no aplicativo</li>
          <li>Enviar notificações relevantes (com sua permissão)</li>
          <li>Melhorar nossos serviços</li>
        </ul>

        <h2 className="text-xl font-semibold text-neutral-textPrimary mt-8 mb-4">
          3. Proteção de Dados
        </h2>
        <p className="text-neutral-textSecondary mb-4">
          Seus dados são armazenados de forma segura e não são compartilhados
          com terceiros sem seu consentimento explícito.
        </p>

        <h2 className="text-xl font-semibold text-neutral-textPrimary mt-8 mb-4">
          4. Seus Direitos
        </h2>
        <p className="text-neutral-textSecondary mb-4">
          Você tem o direito de acessar, corrigir ou excluir seus dados pessoais
          a qualquer momento através das configurações da sua conta.
        </p>

        <h2 className="text-xl font-semibold text-neutral-textPrimary mt-8 mb-4">
          5. Contato
        </h2>
        <p className="text-neutral-textSecondary mb-4">
          Para questões sobre privacidade, entre em contato pelo email:
          <a href="mailto:privacidade@nciaflux.com" className="text-primary-main hover:underline ml-1">
            privacidade@nciaflux.com
          </a>
        </p>
      </div>
    </div>
  );
}
