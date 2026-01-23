# v0.dev Prompt - Biblioteca de Relatórios

## Prompt

```
Create a mobile reports library screen for "NCIAFlux" ADHD app (Advanced plan). This shows available reports the user can access. Reports are optional - user chooses which to see. Never push metrics.

**Design Philosophy:**
- Reports are tools, not judgments
- User pulls when ready, system never pushes
- Visual insights over raw numbers
- Celebrate patterns, not productivity

**Color Palette:**
- Primary: #4A90A4
- Secondary: #E8A87C
- Accent: #85C88A
- Background: #F9FAFB
- Surface: #FFFFFF
- Text Primary: #2D3748
- Text Secondary: #718096

**Screen Layout:**

1. **Header:**
   - Back arrow
   - Title: "Relatórios"
   - Subtitle: "Insights quando você quiser"

2. **Active Report (if one is "pinned"):**
   - "📊 Seu relatório ativo"
   - Card preview of selected report
   - Small chart/visualization preview
   - "Ver completo →"
   - Option to change active report

3. **Report Categories:**

   **Seção: Padrões de Energia**
   - Card: "Energia ao longo do dia"
     - Icon: ⚡
     - Description: "Veja seus horários de pico"
     - Preview: mini line chart
     - Badge: "Popular"

   - Card: "Energia por dia da semana"
     - Icon: 📅
     - Description: "Descubra seus melhores dias"

   **Seção: Foco e Tarefas**
   - Card: "Blocos de foco"
     - Icon: ⏱️
     - Description: "Quanto você tem focado"
     - Note: Shows time, not judgment

   - Card: "Técnicas que funcionam"
     - Icon: 🎯
     - Description: "O que está dando certo"

   **Seção: Padrões Gerais**
   - Card: "Resumo semanal"
     - Icon: 📈
     - Description: "Visão geral da sua semana"
     - Default/simple report

   - Card: "Tendências do mês"
     - Icon: 🗓️
     - Description: "Padrões de longo prazo"

4. **Report Card Design:**
   - Each card has:
     - Icon (left)
     - Title (bold)
     - 1-line description
     - Mini preview visualization (optional)
     - Chevron right
   - Cards are tappable
   - Subtle shadow, rounded-xl

5. **Empty State (if new user):**
   - "Ainda coletando dados..."
   - "Use o app por mais alguns dias para ver insights"
   - Friendly illustration
   - No pressure

6. **Settings Link:**
   - Bottom: "Configurar quais relatórios aparecem"
   - Opens selection screen

7. **Privacy Note:**
   - Small footer text:
   - "🔒 Seus dados ficam no seu dispositivo"
   - "Relatórios são só para você"

**Report Detail Screen (when tapped):**
- Full visualization
- Date range selector
- Key insights in words
- "Compartilhar" option
- Export option (PDF)

**Mobile dimensions:** 390x844
```

## Princípio
- Relatórios mostram padrões, não produtividade
- "Seus melhores horários" não "Suas horas trabalhadas"
- Insights em linguagem humana, não só gráficos
