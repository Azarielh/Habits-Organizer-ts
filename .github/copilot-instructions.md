# Copilot Instructions - Habit's Organizer

## ⚠️ CODE COMMENT RULE
**ALL comments and documentation in this project MUST be written in English.** This includes:
- Code comments (single-line `//` and block `/* */`)
- JSDoc/TSDoc comments
- Commit messages
- Variable/function names should be in English

Example of correct comment:
```typescript
// Toggles the habit completion status for today based on checkbox state
const toggledLogs = toggleLogForToday(payload.completedLogs, payload.isChecked);
```

---

## Project Overview
A full-stack habit tracking web application built with **React 19** (frontend) and **Bun** (backend). Designed for ADHD individuals to build and maintain healthy habits with daily tracking, flexible scheduling, and detailed statistics.

**Tech Stack**: React 19 + TypeScript | Bun runtime | Tailwind CSS + shadcn/ui | JSON file storage

---

## Critical Architecture Patterns

### 1. **Data Flow & State Management**
- **Single source of truth**: `habits-data.json` (persisted on Bun server)
- **Frontend state**: Managed via `useHabits()` hook in `src/hooks/useHabits.ts` - all interactions fetch from `/api/habitsorganizer`
- **Backend routing**: `interaction_router.ts` dispatches POST requests to handlers based on payload type detection (not route-based)
- **Key principle**: Always refetch full habits array after mutations to keep client/server in sync

**Example flow**: User toggles habit → `toggleHabit()` in hook → POST to `/api/habitsorganizer` with `{name, completedLogs, isChecked}` → `routeInteraction()` detects `ToggleHabit` type → `handleToggleHabit()` updates streaks → returns full habits array

### 2. **Type Discrimination Pattern**
The codebase uses **payload-based type guards** instead of traditional routing:
```typescript
// interaction_router.ts dispatches based on payload structure:
if (isToggleHabitPayload(payload)) { /* ... */ }
if (isAddHabitPayload(payload)) { /* ... */ }
if (isDeleteHabitPayload(payload)) { /* ... */ }
```

All type guards are in `src/lib/type.ts`. When adding new operations:
1. Define type in `type.ts` with a guard function (e.g., `isNewOperationPayload()`)
2. Add route logic in `interaction_router.ts`
3. Implement handler in `src/logic/` directory

### 3. **Frequency System** (Core Domain Logic)
Habits support two frequency models:

**String frequencies** (predefined):
- `"quotidien"` (daily) | `"weekend"` | `"semaine"` (weekdays) | `"quinzaine"` | `"mois"` | `"semestre"` | `"an"`

**Custom frequency object**:
```typescript
{ type: "custom", days: ["monday", "wednesday", "friday"], interval?: number }
```

Key functions:
- `isHabitForToday()` (habits.ts) - determines if habit appears in today's view
- `getFrequencyLabel()` (presentation.ts) - translates to UI labels (bilingual FR/EN)
- Always validate with `isFrequency()` guard before processing

### 4. **Streak & Statistics Calculation**
Logic in `src/logic/logs/`:
- **calculateStreaks.ts**: Computes `currentStreak`, `longestStreak` from `completedLogs` array
- **updateCompletedLogs.ts**: Merges new logs with existing ones
- **toggleLogForToday.ts**: Manages daily completion tracking

These run after every modification. Streaks are **recalculated, not cached** to prevent stale data.

---

## Developer Workflows

### Build & Run
```bash
# Development (hot reload enabled)
bun dev          # Starts on http://0.0.0.0:3001

# Production
bun run build    # Compiles to dist/
bun start        # Runs optimized build
```

### Key Commands
- `bun install` - Install dependencies (React 19, Tailwind, shadcn/ui)
- `bun run build.ts --help` - View full Bun build options (minify, sourcemaps, etc.)

### Testing Data
- `habits-data.json` is auto-created on first run
- Data structure: `{ habits: Habit[] }` with JSON cleaning (trailing commas handled in loader)
- Edit directly for manual testing; server persists on each mutation

---

## Project-Specific Conventions

### Naming & Organization
- **UI Components**: `src/components/` - page-level (TodayPage, StatsPage, HabitsList)
- **Reusable UI**: `src/components/ui/` - shadcn components (button, card, input, etc.)
- **Business Logic**: `src/logic/{domain}/` - organized by feature (habits/, logs/)
- **Hooks**: `src/hooks/` - custom React hooks (useHabits is the main orchestrator)
- **Presentation**: `src/lib/presentation.ts` - all UI labels & translations (FR-first, EN fallback)

### Bilingual Support
French is primary language, English fallback. All user-facing text in `presentation.ts`:
```typescript
// getFrequencyLabel returns: "Chaque semaine" (FR) or "weekly" (EN fallback)
// getTimeLabel returns: "🌅 Matin" | "☀️ Après-midi" | "🌙 Soir"
```

### Styling
- Tailwind CSS (v4.1) + shadcn/ui component library
- Custom CSS minimal (globals.css, index.css)
- Use `mergeClassName()` utility for dynamic class composition
- Components.json configured for shadcn component generation

### Error Handling
- Server catches JSON parsing errors (handles trailing commas automatically)
- Frontend catches fetch errors, sets `error` state in useHabits hook
- Logs use console (development-level, no error boundary yet)

---

## Integration Points & Dependencies

### External APIs
- **Bun serve()** API: Raw HTTP server (no framework)
- **React Hooks**: useState, useEffect for state & side effects
- **shadcn/ui + Radix UI**: Components pre-integrated

### File Dependencies Map
```
src/index.ts (Bun server)
  ├→ interaction_router.ts (dispatch logic)
  │  ├→ src/logic/habits/addHabits.ts
  │  ├→ src/logic/habits/deleteHabit.ts
  │  └→ src/lib/logs_manager.ts (toggle handling)
  │     └→ src/logic/logs/* (streak calculation)
  └→ habits.ts (Habit interface & helpers)

src/App.tsx (React root)
  └→ src/hooks/useHabits.ts (state management)
     ├→ Fetches /api/habitsorganizer (polling)
     └→ Calls addHabit/toggleHabit/deleteHabit (mutations)

src/components/
  ├→ TodayPage.tsx (filters habits via isHabitForToday)
  ├→ HabitsList.tsx (displays all habits)
  └→ StatsPage.tsx (aggregates stats from completedLogs)
```

### No Database
Data is purely file-based: `Bun.write()` / `Bun.file()` for persistence. This limits scalability but keeps setup trivial.

---

## Common Modifications

### Adding a New Operation
1. **Define type + guard** in `src/lib/type.ts`
2. **Implement handler** in `src/logic/` directory
3. **Add route** in `interaction_router.ts`
4. **Call from hook** in `src/hooks/useHabits.ts`

### Adding a New Page/View
1. Create component in `src/components/`
2. Hook into `App.tsx` tab system (see currentTab state)
3. Use `useHabits()` for data access
4. Query habits with predicates like `isHabitForToday()` or `isCompletedToday()`

### Changing Frequency Options
1. Update `FrequencyType` union in `src/lib/type.ts`
2. Update `isHabitForToday()` logic in `habits.ts`
3. Add label in `getFrequencyLabel()` in `presentation.ts`

---

## Known Quirks & Future Work

- **No real-time sync**: Frontend must refetch to see server updates
- **No authentication**: All habits are public in local environment
- **File-based storage**: Not suitable for multi-user or cloud deployment
- **Planned**: Mobile app (React Native), coach AI assistant, reminder system, database integration

---

## Quick Reference: Key Files
- **Entry points**: `src/index.ts` (server), `src/index.html` (client), `src/App.tsx` (React root)
- **Habits logic**: `habits.ts`, `src/logic/habits/`
- **Log/streak logic**: `src/logic/logs/`
- **Type safety**: `src/lib/type.ts` (all payload types & guards)
- **API**: Single endpoint `/api/habitsorganizer` (GET all, POST mutations)
