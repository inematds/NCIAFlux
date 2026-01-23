# v0.dev Prompt - Configurações de Notificações

## Prompt

```
Create a mobile notification settings screen for "NCIAFlux" ADHD app. This allows users to configure how and when they receive reminders. Start simple, allow advanced customization.

**Design Philosophy:**
- Simple by default
- User activates more if they want
- No guilt for turning things off
- Preview what notifications look like
- Gentle language throughout

**Color Palette:**
- Primary: #4A90A4
- Secondary: #E8A87C
- Background: #F9FAFB
- Surface: #FFFFFF
- Text Primary: #2D3748
- Text Secondary: #718096
- Toggle On: #4A90A4
- Toggle Off: #CBD5E0

**Screen Layout:**

1. **Header:**
   - Back arrow
   - Title: "Notificações"
   - Subtitle: "Configure como quer ser lembrado"

2. **Master Toggle Section:**
   - Card with:
     - "Receber notificações"
     - Toggle switch (on/off)
     - Helper text: "Você pode desativar tudo se preferir"
   - When off: rest of settings greyed out

3. **Quick Preset Section:**
   - "Escolha seu estilo"
   - 3 preset cards (radio selection):

   **Mínimo (recommended for start):**
   - "1 lembrete gentil por dia"
   - "Sem pressão"
   - Selected state: primary border

   **Moderado:**
   - "Lembretes de check-in e foco"
   - "2-3 por dia"

   **Personalizado:**
   - "Configure cada notificação"
   - Opens detailed settings

4. **Time Preference:**
   - "Melhor horário para lembretes"
   - Time picker or preset options:
     - "Manhã (8h-10h)"
     - "Tarde (14h-16h)"
     - "Noite (18h-20h)"
     - "Deixe o app decidir"

5. **Detailed Settings (expandable/collapsible or separate screen):**
   - Section: "Tipos de notificação"

   Each notification type as a row:

   a) **Check-in diário:**
   - Toggle + description
   - "Pergunta gentil sobre como você está"
   - Frequency: "1x ao dia"

   b) **Lembrete de foco:**
   - Toggle + description
   - "Convite para iniciar seu bloco de foco"

   c) **Celebrações:**
   - Toggle + description
   - "Parabéns por completar tarefas"

   d) **Dicas e insights:**
   - Toggle + description
   - "Pílulas ocasionais sobre TDAH"

6. **Preview Section:**
   - "Como suas notificações vão parecer:"
   - Mock notification card showing tone
   - "Oi Ana! Que tal um check-in rápido? 💙"
   - Shows it's friendly, not demanding

7. **Channel Selection (Advanced plan):**
   - "Onde receber"
   - Options: App, WhatsApp (coming soon badge)
   - Secondary, collapsed by default

8. **Quiet Hours:**
   - "Horários de silêncio"
   - "Não perturbe entre: [22:00] e [07:00]"
   - Time range picker

9. **Save Button:**
   - "Salvar preferências" (primary, bottom)
   - Or auto-save with toast confirmation

**Visual Notes:**
- Use cards to group related settings
- Toggle switches with smooth animation
- Clear visual feedback on changes
- No scary language about "missing out"

**Mobile dimensions:** 390x844
```

## Princípio Importante
- Tom das notificações preview: convite, não cobrança
- Exemplos: "Que tal..." não "Você precisa..."
