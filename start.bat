@echo off
echo ====================================
echo   DevbrainAI Startup Script
echo ====================================
echo.

echo [1/4] Starting Docker containers (PostgreSQL + Redis)...
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to start Docker containers. Make sure Docker Desktop is running.
    pause
    exit /b 1
)

echo.
echo [2/4] Waiting for database to be ready...
timeout /t 5 /nobreak > nul

echo.
echo [3/4] Starting Backend Server...
start cmd /k "cd backend && npm run start:dev"

echo.
echo [4/4] Starting Frontend Server...
timeout /t 3 /nobreak > nul
start cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo   Services Started Successfully!
echo ====================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo Database: http://localhost:8080 (Adminer)
echo API Docs: http://localhost:3000/api/docs
echo.
echo Press any key to stop all services...
pause > nul

echo.
echo Stopping services...
docker-compose down
taskkill /F /IM node.exe 2>nul
echo All services stopped.
pause