# SmartLearn Mobile

Mobile app built with Expo Router and structured for feature parity with web modules.

## Included Modules

- Dashboard
- Library list + library detail + add cards
- Study events + status update
- Notes list + note detail/edit
- Test setup + test session
- Games list
- Notifications center
- Settings
- Profile
- Auth (sign-in / sign-up / sign-out)
- Bilingual UI (Vietnamese / English) with switch in Settings

## Data Architecture

- `shared/firebase/client.ts`: Firebase app/auth/firestore client
- `shared/services/authService.ts`: auth service (email/password)
- `shared/services/firebaseService.ts`: data service using same Firebase collections as web
- `shared/services/provider.ts`: provider resolver (`EXPO_PUBLIC_DATA_PROVIDER`)

This keeps feature screens independent from data source so backend provider can be swapped later.

## Firebase Env

Create `.env` in `mobile/`:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
```

Use the same Firebase project/config as web to share one data source.

## Run

```bash
npm install
npm run start
```

Use:

- `npm run android`
- `npm run ios`
- `npm run web`
