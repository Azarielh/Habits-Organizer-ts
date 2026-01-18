# Habit's Organizer - Mobile (React Native + Expo)

Mobile version of Habit's Organizer built with Expo for iOS and Android.

## Features

- 📱 Native mobile experience (iOS & Android)
- 🌐 Connects to the same API as web version
- 💾 **Offline support** - Automatic caching with AsyncStorage
- ⚡ Real-time habit tracking
- 📊 Statistics and progress tracking

## Prerequisites

- Node.js (v18+)
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Expo Go app on your phone (for testing)

## Installation

```bash
cd mobile
npm install
# or
yarn install
```

## Running the App

### Development

```bash
npm start
# or
yarn start
```

A QR code will appear. Scan it with Expo Go app:
- **iOS**: Use built-in Camera app
- **Android**: Use Expo Go app

### Specific platforms

```bash
# iOS simulator
npm run ios

# Android emulator
npm run android

# Web browser
npm run web
```

## Configuration

**API URL**: Edit `lib/utils.ts` and change `API_URL` to your server IP:

```typescript
export const API_URL = "http://<YOUR_IP>:3001";
```

## Project Structure

```
mobile/
├── app/                    # Navigation & screens (Expo Router)
│   ├── (tabs)/            # Tab-based navigation
│   └── _layout.tsx        # Root layout
├── components/            # Reusable React Native components
├── hooks/
│   └── useHabits.ts      # API & storage management
├── lib/
│   └── utils.ts          # Utilities & constants
├── assets/               # Images & fonts
├── app.json              # Expo configuration
├── package.json
└── tsconfig.json
```

## Offline Support

- Data is automatically cached in AsyncStorage
- If the server is unreachable, the app displays cached data
- When back online, data syncs with the server

## API Integration

Same endpoints as web version:
- `GET /api/habits`
- `POST /api/habits`
- `POST /api/toggle-habit`
- `POST /api/delete-habit`

## Building for Production

### iOS (requires Mac)
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

See [EAS documentation](https://docs.expo.dev/build/introduction/) for details.

## Troubleshooting

**Cannot connect to server:**
- Check `API_URL` in `lib/utils.ts`
- Ensure server is running on port 3001
- Device must be on same network or use VPN

**AsyncStorage not working:**
- Clear Expo cache: `expo start -c`
- Reinstall app

**QR code not scanning:**
- Ensure Expo Go is installed
- Check lighting
- Restart Expo CLI

## Future Features

- Push notifications
- Biometric authentication
- Widgets
- Apple Watch support

## License

MIT - Same as main project
