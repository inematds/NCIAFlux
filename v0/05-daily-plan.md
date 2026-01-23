# v0.dev Prompt - Plano do Dia

## Prompt

```
Create a mobile daily plan screen for "NCIAFlux" ADHD app. This screen shows the user's plan for today with priority, tasks, and focus block. Keep it simple and not overwhelming.

**Design Philosophy:**
- Maximum 1 priority + 2 tasks + 1 focus block
- No long lists
- Easy to adjust
- Celebrates completion gently

**Color Palette:**
- Primary: #4A90A4
- Secondary: #E8A87C
- Accent: #85C88A
- Background: #F9FAFB
- Surface: #FFFFFF
- Text Primary: #2D3748
- Text Secondary: #718096
- Completed: #68D391 (green)

**Screen Layout:**

1. **Header:**
   - Back arrow (if from dashboard)
   - Title: "Seu Plano" (centered)
   - Date: "Hoje, 23 de Janeiro"
   - Edit icon (right side)

2. **Priority Section:**
   - Section label: "🎯 Prioridade do Dia"
   - Large card with:
     - Priority title: "Finalizar relatório do projeto"
     - Status dropdown/chip: "Não iniciado" → "Em progresso" → "Concluído"
     - Optional notes field (collapsed by default)
     - Estimated time: "~2 horas"
   - Card style: white, shadow-md, rounded-2xl, left border accent (primary)

3. **Tasks Section:**
   - Section label: "📝 Tarefas Leves" (max 2)
   - Task cards (smaller than priority):

   Task 1:
   - Checkbox (rounded, animated when checked)
   - "Responder email do cliente"
   - Swipe to complete or tap checkbox
   - When done: strikethrough + green check + subtle celebration

   Task 2:
   - "Organizar mesa de trabalho"
   - Same interaction pattern

   - "➕ Adicionar tarefa" link (if less than 2)

4. **Focus Block Section:**
   - Section label: "⏱️ Bloco de Foco"
   - Card showing:
     - Suggested time: "15:00 - 16:00"
     - Duration: "60 minutos"
     - Technique: "Pomodoro adaptado (25+5)"
     - Button: "Iniciar Foco" (primary)
   - Can tap to adjust time/technique

5. **Techniques Suggestion:**
   - Small section: "💡 Técnicas sugeridas hoje"
   - 3 chips/tags: "Brain dump", "Starter step", "Bloco de energia"
   - Tappable to see explanation
   - Subtle, not prominent

6. **Adjustment Options:**
   - "🔄 Dia não está bom? Ajustar plano"
   - Opens bottom sheet with quick adjustments
   - Option to activate crisis mode

7. **Bottom Navigation:**
   - Same as dashboard
   - "Plano" tab active

**Interactions:**
- Drag to reorder tasks (optional)
- Swipe right on task to complete
- Long press for more options
- Pull to refresh

**Mobile dimensions:** 390x844
```

## Estados
- Tarefa concluída: checkbox verde, texto com strikethrough sutil
- Todas concluídas: mensagem de celebração gentil
- Prioridade concluída: confete sutil
