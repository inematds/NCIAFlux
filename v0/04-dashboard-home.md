# v0.dev Prompt - Painel Principal (Dashboard)

## Prompt

```
Create a mobile dashboard/home screen for "NCIAFlux" ADHD support app. This is the main screen users see daily. It should be clean, calming, and show only essential information.

**Design Philosophy:**
- Calm over productivity
- One clear priority
- No overwhelming metrics
- Quick actions accessible

**Color Palette:**
- Primary: #4A90A4
- Secondary: #E8A87C
- Accent: #85C88A
- Background: #F9FAFB
- Surface: #FFFFFF
- Text Primary: #2D3748
- Text Secondary: #718096
- Energy Low: #FC8181
- Energy Medium: #F6AD55
- Energy High: #68D391

**Screen Layout:**

1. **Header:**
   - Greeting: "Boa tarde, Ana 👋" (dynamic based on time)
   - Subtitle: "Quinta-feira, 23 de Janeiro"
   - Small profile avatar (right side, tappable)

2. **Priority Card (Hero - largest element):**
   - Label: "Sua prioridade hoje"
   - Priority title: "Finalizar relatório do projeto" (20px, bold)
   - Status chip: "Em progresso" (small, primary color background)
   - Subtle progress indicator (optional)
   - Tap to expand/edit
   - Card: white background, shadow-md, rounded-2xl

3. **Quick Stats Row (3 items, horizontal):**

   a) **Energy Indicator:**
   - Label: "Energia"
   - Visual: 3 dots/bars, 2 filled (medium energy)
   - Color: #F6AD55 (medium)
   - Tappable to update

   b) **Focus Status:**
   - Label: "Foco"
   - Visual: Circle icon
   - Text: "Não iniciado" or time if active
   - Tappable to start focus

   c) **Tasks:**
   - Label: "Tarefas"
   - Visual: "1/3" with small checkmark
   - Shows completed/total

4. **Quick Actions Row:**
   - "Iniciar Foco" button (primary, icon + text)
   - "Ajustar Plano" button (outline, icon + text)
   - Both with icons, rounded-xl

5. **Today's Tasks Preview:**
   - Section title: "Tarefas leves"
   - 2 task items max:
     - Checkbox (rounded) + task text
     - Subtle, not overwhelming
   - "Ver plano completo →" link

6. **Crisis Mode Access (subtle but accessible):**
   - Small card or button at bottom
   - "Dia difícil? Ativar modo crise"
   - Muted colors, not prominent but findable
   - Icon: cloud or shelter

7. **Bottom Navigation:**
   - 4 tabs: Home (active), Plano, Chat, Perfil
   - Icons: 🏠 📋 💬 👤
   - Active state: primary color, others muted
   - Safe area padding

**Visual Details:**
- Pull-to-refresh enabled
- Cards have subtle shadows
- Generous spacing between elements
- Touch targets 44px minimum
- No red colors for incomplete items

**Mobile dimensions:** 390x844
```

## Estados Alternativos
- Manhã: "Bom dia" + sol icon
- Noite: "Boa noite" + lua icon
- Modo Crise ativo: interface simplificada
