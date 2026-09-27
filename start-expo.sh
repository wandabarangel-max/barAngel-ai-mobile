#!/usr/bin/env bash
set -e

echo "Installing dependencies..."
npm install

echo ""
echo "========================================"
echo "Starting barAngel AI Expo Tunnel"
echo "========================================"
echo ""
echo "Waiting for Expo to start..."
echo ""

npx expo start --tunnel 2>&1 | tee expo-output.log &
EXPO_PID=$!

sleep 20

if [ -f expo-output.log ]; then
  echo ""
  echo "========================================"
  echo "✅ EXPO URL READY - COPY THIS:"
  echo "========================================"
  EXPO_URL=$(grep "exp://" expo-output.log | head -1 || echo "")
  if [ -z "$EXPO_URL" ]; then
    echo "Still loading... checking logs:"
    cat expo-output.log | tail -20
  else
    echo "$EXPO_URL"
  fi
  echo ""
  echo "Paste this in Expo Go on your Android phone"
  echo ""
fi

wait $EXPO_PID
