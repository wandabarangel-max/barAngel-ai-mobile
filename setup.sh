#!/usr/bin/env bash
set -e

npm install
printf '\nStarting barAngel AI with an Expo tunnel...\n'
printf 'When the Expo QR code and exp:// URL appear, open Expo Go and scan the QR code.\n\n'
npx expo start --tunnel
