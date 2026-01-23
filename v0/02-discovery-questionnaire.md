# v0.dev Prompt - Questionário de Descoberta

## Prompt

```
Create a mobile questionnaire screen for an ADHD app called "NCIAFlux". This is the discovery flow where users answer questions about how their brain works.

**Design Context:**
- One question per screen
- Swipeable card-based answers (not radio buttons)
- Progress indicator at top
- Calming, non-clinical feel

**Color Palette:**
- Primary: #4A90A4
- Primary Light: #7BB5C4
- Secondary: #E8A87C
- Background: #F9FAFB
- Surface (cards): #FFFFFF
- Text Primary: #2D3748
- Text Secondary: #718096
- Selected state: #4A90A4 with light background #E6F3F7

**Screen Elements:**

1. **Header:**
   - Back arrow (subtle, left aligned)
   - Progress bar (thin, rounded, showing step 2 of 4)
   - Progress text: "2 de 4" (small, muted)

2. **Question Area:**
   - Icon/illustration related to question (simple, outlined style)
   - Question text: "Como está sua energia ao longo do dia?" (24px, Nunito bold, centered)
   - Helper text: "Escolha a opção que mais combina com você" (14px, secondary color)

3. **Answer Cards (4 options, vertical stack):**
   Each card should have:
   - Emoji or icon on left
   - Title text (16px, semibold)
   - Optional description (14px, muted)
   - Subtle border, rounded 12px
   - On tap: scale down slightly, then highlight with primary color border

   Example options:
   - "🌅 Manhã é meu momento" - "Acordo com energia, depois vai caindo"
   - "🌙 Sou mais noturno" - "Demoro para engrenar, mas à noite fluo"
   - "🎢 Varia muito" - "Nunca sei como vou estar"
   - "😴 Sempre cansado" - "Energia baixa é meu padrão"

4. **Bottom:**
   - Subtle hint: "Deslize ou toque para responder"
   - Safe area padding

**Interactions:**
- Tapping a card selects it and auto-advances after 300ms
- Cards have hover/pressed states
- Smooth transition between questions

**Mobile dimensions:** 390x844
```

## Variações
- Criar 4 telas diferentes para cada categoria de pergunta:
  1. Dificuldades atuais
  2. Energia e horários
  3. Estilo de execução
  4. Sobrecarga percebida
