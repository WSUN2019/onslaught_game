#!/bin/bash
echo "Starting Onslaught at http://localhost:5000"

# Kill anything already holding port 5000
fuser -k 5000/tcp 2>/dev/null && sleep 0.3

python3 -m http.server 5000 --directory "/home/samsung1466/Python/onslaught_game/" &
SERVER_PID=$!

# Give the server a moment to bind before opening the browser
sleep 0.5
xdg-open "http://localhost:5000" 2>/dev/null \
  || sensible-browser "http://localhost:5000" 2>/dev/null \
  || google-chrome "http://localhost:5000" 2>/dev/null \
  || firefox "http://localhost:5000" 2>/dev/null \
  || echo "Could not detect a browser — open http://localhost:5000 manually"

echo "Server running. Press Enter to stop."
read
kill $SERVER_PID
echo "Server stopped."
