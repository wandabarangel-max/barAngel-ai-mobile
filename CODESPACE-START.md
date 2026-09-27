# Run barAngel AI from GitHub Codespaces

The Expo URL is generated only while the Expo development server is running. It cannot be created permanently in GitHub or before Codespaces starts.

## Start the app

Open this repository in GitHub Codespaces, then run:

```bash
npm install
npx expo start --tunnel
```

The terminal will display a QR code and an `exp://...` URL. Open Expo Go on Android and scan the QR code. If scanning is unavailable, use Expo Go's option to enter the displayed Expo URL.

If the tunnel fails, retry:

```bash
npx expo start --tunnel --clear
```

The Codespace must remain running while Expo Go is connected. Stop the server with `Ctrl+C`.

## Supabase configuration

The app reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `.env`. These values are already configured for this project.
