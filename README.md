# Habit's Organizer

As an ADHD person, I've always been struggling a lot with keeping habits, create new healthy ones.
This is why I've created this habit tracking web application with a React frontend and Bun backend. Build and maintain better habits by tracking daily progress, streaks, and completion rates. This is just a simple prototype to test and use freely. Though, it comes with an API since the longterm goal is to access this app with a coach like AI assistant. 

Feel free to send reports for issue and idea if you have some interest in the project. 

## Features

- 📅 **Daily Tracking**: Track habits for today with multi-iteration support
- 🎯 **Flexible Frequency**: Set habits as daily, weekly, monthly, or custom schedules
- 📊 **Detailed Statistics**: View completion rates, streaks, and progress trends
- ⚡ **Real-time Updates**: Instant feedback when marking habits complete
- 💾 **Persistent Storage**: All data saved to JSON file on server

## Futur Features
- 🌐 **Reminder**: Notifications system or/and alarm can be set as an option for habits
- 📱 React Native version will be made later

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Bun (all-in-one JavaScript runtime)
- **Data**: JSON file storage

## Getting Started

### Prerequisites

- [Bun](https://bun.com) (v1.3.6 or later)

### Installation

1. Clone or download the project
2. Install dependencies:

```bash
bun install
```

### Running the Server

Start the development server:

```bash
bun dev
```

The server will start on `http://0.0.0.0:3001`

**Access from your machine:**
```
http://localhost:3001
```

**Access from another device on your network:**
```
http://<YOUR_MACHINE_IP>:3001
```

Replace `<YOUR_MACHINE_IP>` with your machine's IP address (find it with `ipconfig` on Windows or `ifconfig` on Mac/Linux).

### Production Build

Build and run for production:

```bash
bun run build
bun start
```

## Project Structure

```
├── src/
│   ├── App.tsx                 # Root component
│   ├── frontend.tsx            # React entry point
│   ├── index.html              # HTML template
│   ├── index.ts                # Server configuration
│   ├── hooks/
│   │   └── useHabits.ts        # Centralized habit state management
│   ├── components/
│   │   ├── TodayPage.tsx       # Daily habit tracking
│   │   ├── HabitsList.tsx      # All habits view
│   │   ├── StatsPage.tsx       # Statistics & analytics
│   │   └── ui/                 # Reusable UI components
│   └── lib/
│       └── utils.ts            # Utility functions
├── habits.ts                   # Habit business logic
├── habits-data.json            # Persisted habit data
└── styles/
    └── globals.css             # Global styles
```

## API Endpoints

All endpoints are served from the Bun server at `:3001`:

### GET `/api/habits`
Fetch all habits

```bash
curl http://localhost:3001/api/habits
```

### POST `/api/habits`
Create a new habit

```bash
curl -X POST http://localhost:3001/api/habits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meditation",
    "frequency": "quotidien",
    "iterations": 1,
    "time": "morning"
  }'
```

### POST `/api/toggle-habit`
Mark a habit complete/incomplete

```bash
curl -X POST http://localhost:3001/api/toggle-habit \
  -H "Content-Type: application/json" \
  -d '{"name": "Meditation", "done": false}'
```

### POST `/api/delete-habit`
Delete a habit

```bash
curl -X POST http://localhost:3001/api/delete-habit \
  -H "Content-Type: application/json" \
  -d '{"name": "Meditation"}'
```

## Usage

1. **Add a Habit**: Click "➕ Nouvelle habitude" tab to create a new habit with:
   - Name
   - Frequency (daily, weekly, monthly, custom schedule)
   - Number of iterations (how many times per period)
   - Time slot (morning, afternoon, evening)
   - Optional description

2. **Track Today**: "📅 Aujourd'hui" tab shows habits due today with multi-iteration support

3. **View Statistics**: "📊 Stats" tab displays:
   - Overall completion rate (weighted by effort)
   - Current and best streaks
   - Per-habit analytics
   - Weekly vs global completion rates

## Data Storage

All habit data is stored in `habits-data.json`. The file is automatically created and updated when you:
- Add a new habit
- Toggle completion status
- Delete a habit

## Network Setup

### Local Machine
```
http://localhost:3001
```

### Same Network (LAN)
Find your machine's IP:
- **Windows**: `ipconfig` → look for "IPv4 Address"
- **Mac/Linux**: `ifconfig` → look for "inet"

Then access from any device:
```
http://<YOUR_IP>:3001
```

### Remote Access
For access outside your local network, consider:
- Port forwarding (advanced, security risks)
- VPN
- Ngrok tunneling
- Cloud deployment (Vercel, etc.)

## Development

### Hot Reload
The development server supports hot module reloading. Changes to frontend code are instantly reflected in the browser.

### Build for Production
```bash
bun run build
```

Outputs optimized files to `dist/`

## Troubleshooting

**Port 3001 already in use**
- Change the port in `src/index.ts`

**Cannot access from another device**
- Ensure firewall allows port 3001
- Check your machine's IP address is correct
- Both devices must be on the same network

**Habits not persisting**
- Check `habits-data.json` exists and is writable
- Verify Bun server has file system permissions

## Future Enhancements

- [ ] Loading indicators in UI
- [ ] Better error handling with retry logic
- [ ] localStorage fallback for offline support
- [ ] Weighted average completion rates
- [ ] User authentication
- [ ] Database integration
- [ ] Mobile app

## License

This project is open source and available for personal use.

---

**Questions or issues?** Check the GitHub repository or review the API endpoints above.
 