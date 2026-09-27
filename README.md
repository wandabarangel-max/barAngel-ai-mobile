# barAngel AI Mobile

Expo React Native app for Android and iOS.

## Run on Android from the cloud

1. Copy `.env.example` to `.env` and add the Supabase project URL and publishable key.
2. Install dependencies with `npm install`.
3. Start Expo with `npx expo start`.
4. Install **Expo Go** on your Android phone.
5. Scan the QR code shown by Expo, or open the tunnel URL.

The app includes Supabase email authentication, a dashboard, joke generator, and initial Study, Chat, and Money tabs. It uses the same Supabase project as the web app.

Never add a service-role key to this app. Only use a publishable/anon key, and keep `.env` out of Git.
