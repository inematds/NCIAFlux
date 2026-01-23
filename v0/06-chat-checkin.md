# v0.dev Prompt - Chat de Acompanhamento

## Prompt

```
Create a mobile chat/check-in screen for "NCIAFlux" ADHD app. This is a conversational interface for gentle check-ins, NOT a traditional chatbot. Keep it warm and brief.

**Design Philosophy:**
- Maximum 2 questions per session
- Quick replies preferred over typing
- Tone is always gentle, never demanding
- Feels like a caring friend, not a bot

**Color Palette:**
- Primary: #4A90A4
- Secondary: #E8A87C
- Background: #F9FAFB
- User bubble: #4A90A4 (with white text)
- System bubble: #FFFFFF (with dark text)
- Quick reply chips: #F0F4F8 (light gray)
- Text Primary: #2D3748

**Screen Layout:**

1. **Header:**
   - Back arrow
   - Title: "Acompanhamento"
   - Subtitle: "Conversa gentil"
   - Optional: avatar/mascot icon

2. **Chat Area (scrollable):**

   **System message 1:**
   - Bubble style: white background, rounded-2xl, shadow-sm
   - Left aligned with small margin
   - Text: "Oi Ana! 👋 Como está sendo seu dia até agora?"
   - Timestamp below: "14:32" (small, muted)

   **User response:**
   - Bubble style: primary color background, white text
   - Right aligned
   - Text: "Um pouco cansativo"
   - Timestamp: "14:33"

   **System message 2:**
   - "Entendo... dias assim acontecem. 💙"
   - "Sua energia está como agora?"

   **Quick Replies (chips below last message):**
   - Row of 3-4 tappable chips:
     - "😴 Baixa"
     - "😐 Média"
     - "⚡ Alta"
   - Chips: rounded-full, border, padding
   - Tap highlights then sends

3. **Input Area (bottom):**
   - Text input field (optional use)
   - Placeholder: "Ou digite algo..."
   - Microphone icon (for voice - advanced plan badge)
   - Send button (primary color)
   - Note: "Responder por texto é opcional"

4. **Conversation End State:**
   - After 2 exchanges, show completion:
   - "Pronto! Obrigado por compartilhar. 🌟"
   - "Ajustei seu plano com base na sua energia."
   - Button: "Ver plano ajustado"
   - Or: "Voltar ao início"

5. **Bottom Navigation:**
   - Chat tab active

**Message Styles:**
- System messages: white bg, left aligned, rounded-2xl (squared on left)
- User messages: primary bg, right aligned, rounded-2xl (squared on right)
- Quick replies: appear below system message, disappear after selection
- Typing indicator: 3 dots animation

**Interaction Flow:**
1. System asks question
2. User taps quick reply OR types
3. System acknowledges warmly
4. Optional follow-up (max 1)
5. Closure message
6. Return to dashboard

**Mobile dimensions:** 390x844
```

## Tom de Voz (exemplos)
- "Como você está?" (não "Relate seu status")
- "Entendo..." (não "Registrado")
- "Dias assim acontecem" (não "Performance baixa detectada")
