# HackMatch Frontend Design System

> **Status:** Active Foundation  
> **Source of Truth:** `frontend/src/design-system/` & `frontend/src/index.css`  
> **Target:** HackMatch Core & Spatial UI Primitives  

---

## 1. Design System Principles

1. **Semantic Consistency Over Ad-Hoc Styling**: Identical semantic UI concepts (e.g. skills, status indicators, buttons, form controls) must use canonical components and shared tokens rather than one-off page implementations.
2. **Controlled Variant System**: Semantic differences between related elements must be expressed through explicit `variant` props (e.g., `SkillChip variant="required"` for Skills Needed vs `variant="default"` for Profile skills), never by inventing disjointed HTML/Tailwind fragments.
3. **Pristine Theme Dualism (Zero Light-Mode Leaks)**: Every component must render natively in both Light and Dark themes. Light Mode must never receive black focus rings, dark offsets, pitch-black borders, or unstyled native browser outlines.
4. **Restrained, Tactile Motion**: Micro-interactions provide subtle, tactile feedback (`duration-200`, `-translate-y-0.5`, `active:scale-[0.98]`). All motion strictly respects user accessibility preferences (`prefers-reduced-motion`).
5. **Documentation Integrity & Component Ownership**: Shared components own their internal typography, radius, borders, shadows, focus states, and transitions. Pages provide content, composition, and layouts.

---

## 2. Token Scales & Categories

### A. Semantic Surfaces
Defined via CSS variables and Tailwind utilities:
| Token | Dark Mode Value | Light Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| `--surface-bg` | `#07090e` | `#f8fafc` | Base viewport canvas |
| `--surface-card` | `rgba(15, 23, 42, 0.60)` | `rgba(255, 255, 255, 0.85)` | Floating glass cards (`UserCard`, `HackathonCard`) |
| `--surface-panel` | `rgba(15, 23, 42, 0.58)` | `rgba(255, 255, 255, 0.78)` | Layout panels, sidebars, dashboard widgets |
| `--surface-control` | `rgba(15, 23, 42, 0.70)` | `rgba(255, 255, 255, 0.92)` | Interactive inputs, buttons, dropdown triggers |
| `--surface-elevated`| `rgba(22, 34, 58, 0.85)` | `rgba(255, 255, 255, 0.98)` | Popovers, active dropdown menus, date pickers |
| `--surface-overlay` | `rgba(15, 23, 42, 0.90)` | `rgba(255, 255, 255, 0.95)` | Modal dialogs, critical alerts |

### B. Typography Scale (Plus Jakarta Sans)
- **Display**: `text-3xl sm:text-4xl font-extrabold tracking-tight` (Hero headers)
- **Heading**: `text-xl sm:text-2xl font-bold tracking-tight` (Section headers)
- **Subheading**: `text-base sm:text-lg font-semibold` (Card titles, modal titles)
- **Body**: `text-sm font-normal leading-relaxed` (Paragraphs, descriptions)
- **Label**: `text-xs font-semibold tracking-wide` (Form labels, metadata headers)
- **Caption**: `text-[11px] font-medium text-slate-500 dark:text-gray-400` (Timestamps, counts)
- **Button Text**: `text-xs sm:text-sm font-semibold select-none`
- **Chip Text**: `text-xs font-medium select-none`
- **Mono**: `font-mono text-xs` (`JetBrains Mono` for code, IDs, tokens)

### C. Radius Scale
- `small` (`rounded-lg` / 8px): Tooltips, compact tags, sub-controls
- `control` (`rounded-xl` / 12px): Buttons, inputs, dropdowns, date pickers, filter tabs
- `card` (`rounded-2xl` / 16px): User cards, team request cards, hackathon cards, panels
- `large` (`rounded-3xl` / 24px): Hero banners, dashboard overview cards, modal dialogs
- `pill` (`rounded-full` / 9999px): Skill chips, status badges, verification pills, circular avatars

### D. Spacing & Heights Scale
- Control Heights:
  - `sm`: `h-8 min-h-[32px]`
  - `md`: `h-10 min-h-[40px]` (standard)
  - `lg`: `h-12 min-h-[48px]`
- Chip Heights:
  - `sm`: `min-h-[22px] px-2.5 py-0.5 text-xs`
  - `md`: `min-h-[26px] px-3 py-1 text-xs font-medium` (standard)
  - `lg`: `min-h-[32px] px-3.5 py-1.5 text-sm font-semibold`

### E. Semantic Accents
| Accent | Dark Mode (Text / Bg / Border) | Light Mode (Text / Bg / Border) | Primary Semantics |
| :--- | :--- | :--- | :--- |
| **Indigo** | `#818cf8` / `bg-indigo-500/10` / `border-indigo-500/30` | `#4338ca` / `bg-indigo-50` / `border-indigo-200` | Primary action, Frontend, Intermediate |
| **Cyan** | `#22d3ee` / `bg-cyan-500/10` / `border-cyan-500/30` | `#0e7490` / `bg-cyan-50` / `border-cyan-200` | Secondary accent, Web3, Online |
| **Emerald** | `#34d399` / `bg-emerald-500/10` / `border-emerald-500/30` | `#047857` / `bg-emerald-50` / `border-emerald-200` | Verified, Active, Open, Backend |
| **Amber** | `#fbbf24` / `bg-amber-500/10` / `border-amber-500/30` | `#b45309` / `bg-amber-50` / `border-amber-200` | Pending, Warning, AI & Data |
| **Rose** | `#f43f5e` / `bg-rose-500/10` / `border-rose-500/30` | `#be123c` / `bg-rose-50` / `border-rose-200` | Rejected, Closed, Danger, Inactive |
| **Purple** | `#c084fc` / `bg-purple-500/10` / `border-purple-500/30` | `#7e22ce` / `bg-purple-50` / `border-purple-200` | Advanced, Design, UI/UX |
| **Slate** | `#94a3b8` / `bg-slate-800/80` / `border-slate-700` | `#475569` / `bg-slate-100` / `border-slate-300` | Unverified, Neutral, Fallback |

---

## 3. Motion & Micro-Interactions

- **Hover Elevation**: `hover:-translate-y-0.5 transition-transform duration-200 ease-out`
- **Active/Pressed**: `active:translate-y-0 active:scale-[0.98] transition-all duration-150 ease-out`
- **Focus Transition**: `transition-all duration-150 ease-out`
- **Open/Close Popovers**: `280ms cubic-bezier(0.16, 1, 0.3, 1)`
- **Reduced Motion**: All components automatically strip animations and transitions under `@media (prefers-reduced-motion: reduce)`.

---

## 4. Accessibility & Focus System

Focus rings must be theme-aware with distinct offset matching the surface background:
```css
/* Canonical Focus Class */
focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-indigo-500/70 
focus-visible:ring-offset-2 
focus-visible:ring-offset-white 
dark:focus-visible:ring-offset-slate-900
```
- In **Light Mode**: `--focus-ring-offset` resolves to `#ffffff`, preventing dark halos.
- In **Dark Mode**: `--focus-ring-offset` resolves to `#0f172a`, matching the dark slate surface.
- Native browser outline overrides: `outline: none;` on focusable custom controls when `focus-visible` styling is active.

---

## 5. Component Hierarchy & Composition

```
Canonical Foundations (Owned by Design System)
├── SpatialButton (primary, secondary, outline, ghost, danger)
├── SpatialIconButton (sm, md, lg + aria-label + tooltip)
├── SkillChip (default, required, matched, selected, interactive, removable)
├── StatusBadge (status, verification, experience, mode, source)
├── SpatialInput & SpatialTextarea (default, search, error)
├── SpatialCard & SpatialPanel (flat, raised, floating, overlay)
├── FilterChip & SpatialTabs (pill, tab)
├── Avatar (xs, sm, md, lg, xl, 2xl + ring + monogram fallback)
├── SpatialDropdown (portal-ready, theme-aware)
├── SpatialDatePicker (portal-ready, theme-aware)
├── SpatialModal (portal-based, scrollbar-stable)
└── SpatialTooltip (micro-glass floating)

Composed / Specialized Primitives
├── VerificationBadge (composes StatusBadge / Badge)
├── MatchScoreBadge (composes StatusBadge / Badge)
└── ExperienceBadge (composes StatusBadge / Badge)
```

---

## 6. Page vs. Component Governance Rules

| Rule | Permitted on Page | Must be Owned by Shared Component |
| :--- | :--- | :--- |
| **Layout & Grid** | ✅ Grid columns, flex arrangement, section gaps, page margins | ❌ Internal component layout |
| **Component Radius** | ❌ Never define raw `rounded-*` on shared controls | ✅ Component defines its own radius from `RADIUS` scale |
| **Paddings & Sizing** | ❌ Never invent custom button/input padding | ✅ Handled via `size="sm"`, `"md"`, `"lg"` |
| **Typography** | ❌ Never override internal button/chip fonts | ✅ Handled via canonical text scales |
| **Theme & Focus** | ❌ Never write hardcoded `ring-offset-slate-900` | ✅ Handled by canonical focus tokens |
| **Semantic Variants** | ✅ Select variant (`variant="required"`, `"interactive"`) | ✅ Component implements the variant styling |

---

## 7. Migration Roadmap

1. **Step 3A (Current)**: Foundation & Design System establishment (Tokens, Contracts, Rules, CSS custom properties).
2. **Step 3B**: Build canonical primitives (`SkillChip`, `SpatialIconButton`, `StatusBadge`, `SpatialInput`, `SpatialTextarea`, `FilterChip`, `Avatar`).
3. **Step 3C**: Systematic migration of student/public pages (14 routes).
4. **Step 3D**: Systematic migration of admin pages (7 routes).
5. **Step 3E**: Verification, Edge browser CDP inspection, and final regression sign-off.
