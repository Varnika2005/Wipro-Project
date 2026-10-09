@echo off
echo =====================================================================
echo  Starting NetSentinel AI (Backend FastAPI + Frontend Vite)
echo =====================================================================

start "NetSentinel AI Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "NetSentinel AI Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo NetSentinel AI is starting up!
echo   - Backend API: http://127.0.0.1:8000 (Swagger docs: http://127.0.0.1:8000/docs)
echo   - Frontend NOC: http://127.0.0.1:5173
echo.
pause
