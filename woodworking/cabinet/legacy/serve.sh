#!/bin/bash

# Start a simple HTTP server for Cabinet Maker Pro
# This is required because the app loads JSON files via fetch()

PORT=${1:-8000}

echo "================================================"
echo "  Cabinet Maker Pro - Development Server"
echo "================================================"
echo ""
echo "Starting server on http://localhost:$PORT"
echo ""
echo "Open in browser:"
echo "  http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================================"
echo ""

python3 -m http.server $PORT
