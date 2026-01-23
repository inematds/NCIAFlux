# v0.dev Prompt - Bloco de Foco (Timer)

## Prompt

```
Create a mobile focus timer screen for "NCIAFlux" ADHD app. This is where users do focused work with a pomodoro-style timer. Include a "brain dump" feature for capturing distracting thoughts.

**Design Philosophy:**
- Clean, distraction-free
- Large, readable timer
- Easy escape without guilt
- Brain dump always accessible
- Celebrate completion, not streaks

**Color Palette:**
- Primary: #4A90A4
- Secondary: #E8A87C
- Accent: #85C88A
- Background: #1A1D29 (dark, focused) OR #F9FAFB (light option)
- Timer ring: #4A90A4
- Progress: #85C88A
- Text: #FFFFFF (dark mode) or #2D3748 (light)

**Screen Layout (Dark Mode Focus):**

1. **Header (minimal):**
   - Back/close icon (X) - top left, subtle
   - "Bloco de Foco" - small, centered
   - Settings gear - top right, subtle

2. **Timer Display (Hero, centered):**
   - Large circular progress ring
   - Ring: primary color, 8px stroke, rounded caps
   - Background ring: subtle dark gray
   - Inside circle:
     - Time remaining: "18:42" (large, 48px, bold, monospace)
     - Label below: "minutos restantes"
   - Total session shown outside: "25 min"

3. **Current Task Display:**
   - Below timer
   - Card or pill showing:
     - "Trabalhando em:"
     - "Finalizar relatório" (truncated if long)
   - Subtle, doesn't compete with timer

4. **Control Buttons (bottom third):**

   **Primary controls (large):**
   - Play/Pause button (circular, 64px, primary color)
   - Icon changes based on state

   **Secondary controls (row below):**
   - "Parar" (stop completely, outline style)
   - "Brain Dump" (capture thought, with 📝 icon)
   - "+5 min" (extend timer, outline)

5. **Brain Dump Feature:**
   - Tapping opens bottom sheet
   - Simple text input: "Anote o pensamento que está te distraindo..."
   - Quick save button
   - List of captured thoughts (collapsible)
   - "Você pode resolver isso depois"
   - Thoughts saved for review post-session

6. **Progress Indicators (subtle):**
   - Small dots showing pomodoro cycle (e.g., ●●○○ = 2/4 complete)
   - Optional, not required to show

7. **Session Complete State:**
   - Timer hits 0
   - Gentle celebration animation
   - "🎉 Foco completo!"
   - "Você focou por 25 minutos"
   - Options:
     - "Fazer pausa (5 min)"
     - "Continuar focando"
     - "Encerrar sessão"
   - Brain dump review option

**Pause State:**
- Timer paused
- Overlay message: "Pausado - sem pressa"
- Resume and Stop buttons prominent

**Interactions:**
- Tap anywhere on timer area to pause/resume
- Long press for quick actions
- Swipe down to minimize (continues in background)
- Notification when timer ends

**Mobile dimensions:** 390x844
```

## Estados Adicionais
- Timer ativo (contando)
- Pausado
- Sessão completa
- Pausa entre sessões
