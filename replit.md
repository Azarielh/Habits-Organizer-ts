# Habit's Organizer

A habit tracking application built with Bun and React.

## Overview

This is a full-stack web application that helps users track their daily habits. Users can create, manage, and track their habits over time.

## Tech Stack

- **Runtime**: Bun 1.2
- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Lucide React icons
- **Build Tool**: Bun's built-in bundler with bun-plugin-tailwind

## Project Structure

```
├── src/
│   ├── index.ts          # Main server entry point (serves API + frontend)
│   ├── index.html         # HTML entry point
│   ├── frontend.tsx       # React app entry
│   ├── App.tsx            # Main React component
│   ├── components/        # UI components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions
├── habits.ts              # Habit data types and functions
├── build.ts               # Production build script
└── styles/                # CSS files
```

## Running the Application

Development server:
```bash
bun --hot src/index.ts
```

Production build:
```bash
bun run build
```

## API Endpoints

- `GET /api/habits` - Fetch all habits
- `POST /api/habits` - Create a new habit
- `POST /api/toggle-habit` - Toggle habit completion status
- `POST /api/delete-habit` - Delete a habit

## Data Storage

Habits are persisted to `habits-data.json` in the project root.

## Recent Changes

- January 18, 2026: Initial import and Replit environment setup
  - Configured server to use port 5000 for Replit compatibility
  - Set up development workflow with hot reloading
