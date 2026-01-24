/**
 * Crisis Mode Types
 */

export interface CrisisMission {
  id: string;
  text: string;
  emoji: string;
}

export interface CrisisMode {
  is_active: boolean;
  activated_at?: Date;
  expires_at?: Date;
  mission?: CrisisMission;
  notifications_paused: boolean;
}

export interface CrisisModeResponse {
  daily_plan_id: string;
  crisis_mode: CrisisMode;
  message: string;
}

export const CRISIS_MISSIONS: CrisisMission[] = [
  { id: '1', text: 'Beba um copo de água', emoji: '💧' },
  { id: '2', text: 'Respire fundo 3 vezes', emoji: '🌬️' },
  { id: '3', text: 'Apenas descanse', emoji: '🛋️' },
  { id: '4', text: 'Dê uma volta curta', emoji: '🚶' },
  { id: '5', text: 'Coma algo leve', emoji: '🍎' },
  { id: '6', text: 'Apenas exista - isso é suficiente', emoji: '🌟' },
  { id: '7', text: 'Escute uma música que você gosta', emoji: '🎵' },
  { id: '8', text: 'Olhe pela janela por um minuto', emoji: '🪟' },
];

export const CRISIS_MESSAGES = {
  activation: [
    'Está tudo bem.',
    'Hoje é dia de cuidar de você.',
    'Não precisa fazer nada além de existir.',
    'Um dia difícil não define você.',
  ],
  deactivation: [
    'Que bom que você está se sentindo melhor!',
    'Você lidou com isso. Isso é força.',
    'Pronto para um novo começo?',
  ],
};
