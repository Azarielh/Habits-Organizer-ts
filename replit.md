# Habits Organizer

This repository is a Bun and React 19 application written in TypeScript and styled with Tailwind CSS 4.

## Run

Start the development server with `bun run dev`. The server listens on port `3001` and serves the interface and API from `src/index.ts`.

## Data and API

Habit data is stored in `habits-data.json`. `GET /api/habitsorganizer` returns all habits. `POST /api/habitsorganizer` creates, deletes, or updates a repetition according to the request shape; see the README for examples.

The local habit day uses a 04:00 boundary. Completion records retain their local habit date and schedule-period key so a repetition can be unchecked without changing other records.
