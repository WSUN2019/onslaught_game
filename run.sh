#!/bin/bash
echo "Starting Onslaught at http://localhost:5000"

python3 -m http.server 5000 --directory "/home/samsung1466/Python/onslaught_game/" &
SERVER_PID=$!

# Give the server a moment to bind before opening the browser
sleep 0.5
xdg-open "http://localhost:5000" 2>/dev/null \
  || sensible-browser "http://localhost:5000" 2>/dev/null \
  || google-chrome "http://localhost:5000" 2>/dev/null \
  || firefox "http://localhost:5000" 2>/dev/null \
  || echo "Could not detect a browser — open http://localhost:5000 manually"

wait $SERVER_PID
