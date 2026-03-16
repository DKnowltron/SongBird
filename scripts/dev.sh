#!/bin/bash
# Start all services for local development
# Usage: ./scripts/dev.sh

echo "Starting Storyteller dev environment..."
echo ""

# Start API on port 3001 (background)
echo "[API] Starting on port 3001..."
PORT=3001 npx tsx src/index.ts &
API_PID=$!

# Start web app (background)
echo "[WEB] Starting on port 3000..."
cd web && npm run dev &
WEB_PID=$!
cd ..

echo ""
echo "Services starting:"
echo "  API:  http://localhost:3001"
echo "  Web:  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services."

# Trap Ctrl+C to kill both
trap "echo ''; echo 'Shutting down...'; kill $API_PID $WEB_PID 2>/dev/null; exit 0" INT TERM

# Wait for both
wait
