#!/usr/bin/env bash
echo "====================================================================="
echo " Starting NetSentinel AI (Backend FastAPI + Frontend Vite)"
echo "====================================================================="

cd "$(dirname "$0")/backend" && source venv/bin/activate && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
cd "$(dirname "$0")/frontend" && npm run dev &

wait
