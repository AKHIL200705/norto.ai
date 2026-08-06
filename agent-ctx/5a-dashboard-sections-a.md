# Task 5a — Dashboard Sections A (home, ai-assistant, smart-map, budget-planner)

## Agent
full-stack-developer (Dashboard sections A)

## Task
Built the 4 dashboard section components owned by Task 5a:
1. `src/components/dashboard/sections/home.tsx` → `DashboardHome`
2. `src/components/dashboard/sections/ai-assistant.tsx` → `AiAssistant`
3. `src/components/dashboard/sections/smart-map.tsx` → `SmartMap`
4. `src/components/dashboard/sections/budget-planner.tsx` → `BudgetPlanner`

## Work Log
- Read worklog (Tasks 1–4), dashboard-shell.tsx, store.ts, types.ts, page.tsx, globals.css, all relevant API routes (chat, budget, places).
- Home: hero glassmorphism greeting card (emerald gradient + amber Sparkles orb), 4 quick-stat cards (city/budget/saved/language), 6-card Quick Actions grid with framer-motion hover lifts, AI Insight of the day card, Recent activity list, Recommended-for-you grid. All whileInView staggered.
- AI Assistant: header w/ online badge + Clear button + prominent "Generate Full Relocation Guide" CTA (calls `/api/ai/relocation`). Two-col layout (chat + sticky suggested prompts on desktop, horizontal chips on mobile). Empty state with floating Sparkles illustration. Auto-grow textarea, Enter-to-send, Shift+Enter newline, typing indicator (3 bouncing dots), guide loading state. Local greeting injected once via ref guard. User = emerald bubble right, assistant = card with `prose-ll` markdown via react-markdown. Uses `useChatStore('assistant')`.
- Smart Map: stylized CSS/SVG canvas with mesh-bg + decorative rotated "roads" + "you-are-here" pulsing indicator. 24 hardcoded mock places with realistic Indian names across 14 categories (restaurant, hospital, metro, pharmacy, bank, atm, coworking, etc.). Multi-select category chips (default restaurant/hospital/metro). Filters bar: Budget (All/Budget/Premium), Rating (All/4+/4.5+), Open Now switch, Favorites switch. Markers colored per-category with hover label and click-to-open detail popover (stars, price, distance, Open/Closed badge, Save button). Right sidebar list mirrors filtered places. Save calls `POST /api/places` with toast feedback. "Save all visible" affordance in header. Custom color map avoids all indigo/blue (uses emerald/amber/rose/teal/violet/fuchsia/pink/slate/orange/yellow).
- Budget Planner: input form (7 fields w/ pre-filled defaults, salary highlighted) + live preview totals. On submit → `/api/ai/budget` with city. Results: 3 summary cards (Total/Remaining/Savings Rate color-coded green/amber/red + status badge), Pie chart (recharts) + Bar chart side-by-side in Cards, AI Score gauge (animated SVG circular progress, color & status label tiered), Emergency Fund hero card with 1/3/6-month grid, AI Insights grid (3 cards w/ Lightbulb icons, staggered reveal), Better Alternatives list (with ArrowRight icons + hover TrendingDown). Fallback: raw text in `<pre>` when analysis null but raw exists. Loading skeletons rendered during fetch.
- Lint: `bun run lint` → exit 0, no errors/warnings in any of the 4 files.
- Dev log: page.tsx import errors visible ONLY for files owned by Task 5b (weather, translator, emergency, food, ocr, saved-places, profile). My 4 files resolve cleanly (their imports appear only as part of the trace, never as the failing module).

## API contracts used
- `POST /api/ai/chat` body `{ message, city, history: [{role, content}] }` → `{ response }`
- `POST /api/ai/relocation` body `{ city, budget }` → `{ guide }`
- `POST /api/ai/budget` body `{ salary, rent, food, transport, utilities, entertainment, shopping, city }` → `{ totals, analysis | null, raw? }`
- `POST /api/places` body `{ name, category, address?, rating?, price?, distance?, notes? }` → `{ place }`

## Store usage
- `useAppStore`: `city`, `setSection('assistant'|'map'|'budget'|'weather'|'translator'|'emergency')`
- `useChatStore`: `messages['assistant']`, `addMessage(section, msg)`, `clearSection(section)` — chat history persists only for the AI Assistant section.

## Stage Summary — artifacts
- `src/components/dashboard/sections/home.tsx` (export: `DashboardHome`)
- `src/components/dashboard/sections/ai-assistant.tsx` (export: `AiAssistant`)
- `src/components/dashboard/sections/smart-map.tsx` (export: `SmartMap`)
- `src/components/dashboard/sections/budget-planner.tsx` (export: `BudgetPlanner`)

All four client components, emerald + amber palette only (zero indigo/blue), fully responsive (mobile-first), framer-motion reveals, sonner toasts, react-markdown for AI text, recharts for budget charts.
