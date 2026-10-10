@echo off
echo =====================================================================
echo  Starting NetSentinel AI (Backend FastAPI + Frontend Vite)
echo =====================================================================
echo Cleaning up existing processes on ports 8000 and 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

start "NetSentinel AI Backend (FastAPI)" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "NetSentinel AI Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo NetSentinel AI is starting up!
echo   - Backend API: http://127.0.0.1:8000 (Swagger docs: http://127.0.0.1:8000/docs)
echo   - Frontend NOC: http://127.0.0.1:5173
echo.
pause
