@echo off
echo ====================================
echo   DevbrainAI Startup (No Docker)
echo ====================================
echo.
echo This version uses SQLite instead of PostgreSQL
echo and in-memory cache instead of Redis.
echo.

echo [1/3] Setting up SQLite environment...
copy backend\.env.sqlite backend\.env > nul
echo SQLite configuration applied.

echo.
echo [2/3] Starting Backend Server...
start cmd /k "cd backend && npm run start:dev"

echo.
echo [3/3] Starting Frontend Server...
timeout /t 3 /nobreak > nul
start cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo   Services Started Successfully!
echo ====================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo API Docs: http://localhost:3000/api/docs
echo.
echo Note: Using SQLite database (no Docker required)
echo.
echo Press any key to stop all services...
pause > nul

echo.
echo Stopping services...
taskkill /F /IM node.exe 2>nul
echo All services stopped.
pause