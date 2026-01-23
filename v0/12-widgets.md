# v0.dev Prompt - Widgets iOS/Android

## Prompt

```
Create mobile widget designs for "NCIAFlux" ADHD app. These are home screen widgets for iOS and Android that allow quick actions without opening the app.

**Design Philosophy:**
- One-tap actions
- Glanceable information
- Match system widget style
- Consistent with app branding
- Accessible without overwhelming

**Color Palette:**
- Primary: #4A90A4
- Secondary: #E8A87C
- Accent: #85C88A
- Background: #FFFFFF (light) / #1A1D29 (dark)
- Text Primary: #2D3748 / #FFFFFF
- Support both light and dark mode

---

## Widget 1: Quick Focus (Small - 2x2)

**Purpose:** Start focus session with one tap

**Layout:**
- Background: White/Dark with subtle gradient
- App icon (small, top-left corner)
- Main icon: Play button or focus icon (large, centered)
- Label below: "Iniciar Foco"
- Border radius: matches system (iOS: 20px, Android: 16px)

**Tap Action:** Opens app directly to focus timer, starts counting

**States:**
- Default: "Iniciar Foco" with play icon
- Focus Active: Shows time "18:42" with pause icon
- Tap while active: pause/resume

---

## Widget 2: Energy Check-in (Small - 2x2)

**Purpose:** Quick energy level input

**Layout:**
- Background: White/Dark
- Question: "Energia?" (top, small)
- 3 tappable zones:
  - 😴 (left) - Low
  - 😐 (center) - Medium
  - ⚡ (right) - High
- Current selection subtly highlighted

**Tap Action:** Registers energy, shows brief confirmation, syncs

**Visual:**
- Emojis or simple icons
- Tappable areas are clear
- Feedback animation on tap

---

## Widget 3: Today's Priority (Medium - 4x2)

**Purpose:** Show and complete today's main priority

**Layout:**
- Background: White/Dark with left accent border (primary color)
- Header row: App icon + "Prioridade Hoje"
- Main content:
  - Priority text: "Finalizar relatório" (truncate if long)
  - Status chip: "Em progresso"
- Right side: Large checkbox (tappable)

**Tap Actions:**
- Tap text: Opens app to plan
- Tap checkbox: Marks complete with celebration

**States:**
- In progress: as described
- Completed: Checkmark, strikethrough, green accent

---

## Widget 4: Daily Overview (Large - 4x4)

**Purpose:** Full glance at today's plan

**Layout:**
- Background: White/Dark
- Header: "Seu Dia" + date
- Sections:

  **Priority:**
  - Primary task with checkbox

  **Tasks:**
  - 2 secondary tasks with checkboxes

  **Focus:**
  - "Foco: Não iniciado" or time if active
  - Small play button

  **Energy:**
  - Current energy indicator (3 dots)

- Footer: "Abrir NCIAFlux"

**Tap Actions:**
- Each item tappable
- Tasks can be completed from widget
- Focus starts from widget

---

## Widget 5: Crisis Mode (Small - 2x2)

**Purpose:** Quick access to crisis mode

**Layout:**
- Background: Soft blue-gray gradient
- Icon: Cloud or shelter (centered)
- Label: "Modo Crise"
- Subtle, not alarming

**Tap Action:** Activates crisis mode directly

**Note:** This widget is optional, user chooses to add it

---

## Widget Style Guidelines:

**iOS (WidgetKit):**
- Corner radius: 20px
- System font (SF Pro)
- Support widget families: small, medium, large
- Deep linking for tap actions

**Android (Glance/App Widgets):**
- Corner radius: 16px (Material You)
- System font (Roboto)
- Responsive layouts
- Dynamic colors support (Material You)

**Both:**
- Dark mode support (automatic)
- Refresh every 15-30 minutes
- Offline capable (cached data)
- Accessibility labels

**Dimensions:**
- Small: 155x155 (iOS), varies (Android)
- Medium: 329x155 (iOS)
- Large: 329x345 (iOS)
```

## Notas de Implementação
- Widgets usam dados em cache
- Ações sincronizam quando possível
- Não dependem de conexão para exibir
