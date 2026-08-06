# Task 5b — Dashboard Sections B (weather, translator, emergency, food, ocr, saved-places, profile)

## Agent
full-stack-developer (Dashboard sections B)

## Task
Built the remaining 7 dashboard section components owned by Task 5b. The orchestrator `src/app/page.tsx` imports all 7 named exports directly, so exact file names + export names are critical.

1. `src/components/dashboard/sections/weather.tsx` → `WeatherView`
2. `src/components/dashboard/sections/translator.tsx` → `Translator`
3. `src/components/dashboard/sections/emergency.tsx` → `Emergency`
4. `src/components/dashboard/sections/food.tsx` → `FoodView`
5. `src/components/dashboard/sections/ocr.tsx` → `OcrScanner`
6. `src/components/dashboard/sections/saved-places.tsx` → `SavedPlaces`
7. `src/components/dashboard/sections/profile.tsx` → `Profile`

## Work Log
- Read worklog (Tasks 1–5a), agent-ctx/5a-dashboard-sections-a.md, store.ts, types.ts, page.tsx, weather route, dashboard-shell, and one 5a component (home.tsx) to lock in styling conventions: emerald + amber palette, framer-motion stagger reveals, sonner toasts, react-markdown prose-ll, glassmorphism, mobile-first.
- Confirmed shared fetch helper contract: `api(path, { method?, body? })` with single `Content-Type: application/json` header (deduped from the spec's typo'd version).
- Weather: condition-aware sky gradient (sunny → amber/emerald; cloudy/rain/storm/fog/snow → slate/teal — slate is the only non-emerald/amber tint and is explicitly permitted for "rainy mood"). Lucide icon map sun/cloud/rain/storm/snow/fog. Hero card with big temp + condition + feels-like + 3 stat tiles (Humidity/Wind/UV). 7-day forecast horizontal scroll → 7-col grid on desktop. recharts AreaChart for temp trend (emerald gradient). Animated SVG UV gauge (circular progress) + UV bar + tiered exposure guidance. Clothing + travel tip cards. Raw fallback pre-block. Skeleton + error+retry. Refresh button.
- Translator: From/To `Select` (LANGUAGES) + swap button. Source `Textarea` + read-only translation panel with Copy + Speak (`SpeechSynthesisUtterance`) buttons. Quick phrase book grid (PHRASE_BOOK chips → fill source + auto-translate). `Tabs` Text | Voice | Saved. Voice tab: mic button (decorative, Web Speech API guarded with `typeof window !== 'undefined' && 'webkitSpeechRecognition' in window`), "Voice input not supported" fallback message, auto-translate on result. Saved Phrases tab: useState list persisted to localStorage `lifelens-saved-phrases` with Reuse + Remove. Camera OCR hint card → `setSection('ocr')`.
- Emergency: pulsing red SOS button (animate-ping ring + Siren icon) → AlertDialog confirm → countdown 5→0 → "SOS Active" state + "Sharing live location…" badge + Cancel SOS. Emergency hotlines grid (108/100/101/1091/104/1070) as `tel:` anchor cards. Nearby services list (3 hospitals, 2 police, 2 fire, 1 blood bank) with Open 24/7 badges + Call/Directions/Save (POST /api/places). Share Live Location card with mini map panel + Start/Stop. Disaster alerts panel (amber/orange tints). Safety tips `Accordion` (5 items). Rose/red for emergency accents, emerald for non-emergency.
- Food: filters bar (Meal / Preference / Budget) as button-group chips. "Recommend Food" → POST /api/ai/food. Loading skeleton grid. Food cards with veg/non-veg dot, name, type badge, price, 5-star rating, distance, description (line-clamp-3), Save (POST /api/places) / View on Map (`setSection('map')`) / Order (decorative). Empty state CTA. Raw fallback pre-card when foods empty but raw present. "Surprise me" button (Dices icon) picks random filters.
- OCR: drag-and-drop upload zone + file input (5MB cap, image/* only) → FileReader dataURL + preview with remove button. Extract → POST /api/ocr. Staged progress messages + skeleton shimmer during loading. Result rendered with `react-markdown` inside `prose-ll` card + Copy button. 4 use-case cards (Rent Agreement, Restaurant Menu, Street Sign, Government Form) → set context note. Recent scans persisted to localStorage `lifelens-recent-scans` (max 8) with thumbnail, timestamp, context badge, View + Remove.
- Saved Places: loads on mount via GET /api/places. 4 stat cards (Total, Visited, Categories, Top category). Search box (with clear) + category filter chips derived from loaded places (with counts). Card grid: name, Visited/To-visit toggle badge, category color badge (zero indigo/blue), stars, address, price+distance, italic notes, created date, Mark visited/Undo + Remove (DELETE /api/places). Add manually `Dialog` with name/category Select (PLACE_CATEGORIES)/address/rating/price/notes → POST /api/places. Refresh button. Empty state with "Explore the map" CTA. No-matches state with Clear filters.
- Profile: emerald gradient header card with avatar (gradient square + initials "CE"), name/email/occupation/city, "Explorer Tier" + "Verified" badges, Edit Profile toggle. 4 stat cards. Edit mode = 2-col form (Name, Email, Occupation, Language Select from LANGUAGES, Monthly Budget number, Food Preference Select Veg/Non-Veg/Eggetarian, Preferred Transport Select Public/Own Vehicle/Walk/Bike, Current City) → Save calls `updateUser` + toast. View mode = side-by-side Notification preferences (4 `Switch` toggles) + Travel history timeline (4 cities with vertical line). Connected services card (4 services, "Connected" with green pulse dots). Danger zone (rose tint) with Reset all data (`AlertDialog` → clears 3 localStorage keys + reloads) and Sign out (decorative → `setView('landing')`).
- Lint: `bun run lint` initially reported 3 warnings (unused eslint-disable directives). Removed all three. Re-ran → exit 0, 0 errors, 0 warnings across the whole project.
- Dev log: stale "Module not found: @/components/dashboard/sections/profile" entries were from before profile.tsx existed (it was the last file written). After all 7 files were in place, dev server reported `✓ Compiled` and `GET / 200` — verified by triggering a fresh curl request (200 response).

## API contracts used
- `GET /api/weather?city={city}` → `{ weather: { current, forecast[7], clothing, travelTip }, raw? }`
- `POST /api/ai/translate` body `{ text, from, to }` → `{ translation }`
- `POST /api/ai/food` body `{ city, meal?, preference?, budget? }` → `{ foods: [...] | [], raw? }`
- `POST /api/ocr` body `{ image: dataURL }` → `{ result }` (Markdown)
- `GET /api/places` → `{ places: [...] }`
- `POST /api/places` body `{ name, category, address?, rating?, price?, distance?, notes? }` → `{ place }`
- `DELETE /api/places` body `{ id }` → `{ success: true }`

## Store usage
- `useAppStore`: `city`, `user`, `updateUser`, `setSection`, `setView`
- localStorage (not in store): `lifelens-saved-phrases` (translator), `lifelens-recent-scans` (ocr)

## Stage Summary — artifacts
- `src/components/dashboard/sections/weather.tsx` (export: `WeatherView`)
- `src/components/dashboard/sections/translator.tsx` (export: `Translator`)
- `src/components/dashboard/sections/emergency.tsx` (export: `Emergency`)
- `src/components/dashboard/sections/food.tsx` (export: `FoodView`)
- `src/components/dashboard/sections/ocr.tsx` (export: `OcrScanner`)
- `src/components/dashboard/sections/saved-places.tsx` (export: `SavedPlaces`)
- `src/components/dashboard/sections/profile.tsx` (export: `Profile`)

All seven are client components (`'use client'`), emerald + amber palette only (slate used solely for rainy/stormy weather mood), fully responsive (mobile-first, `p-4 lg:p-6 max-w-7xl mx-auto` wrappers), framer-motion stagger reveals + hover lifts, sonner toasts, react-markdown `prose-ll` for OCR output, recharts AreaChart for weather trend, shadcn Tabs/Dialog/AlertDialog/Accordion/Select/Switch primitives throughout. Did NOT touch page.tsx, layout.tsx, globals.css, api/*, lib/*, landing/*, or any 5a-owned file. Lint clean (0 errors, 0 warnings). App compiles and serves 200.
