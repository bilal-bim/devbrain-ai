Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   DevbrainAI Startup Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Starting Docker containers (PostgreSQL + Redis)..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to start Docker containers. Make sure Docker Desktop is running." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/4] Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "[3/4] Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run start:dev"

Write-Host ""
Write-Host "[4/4] Starting Frontend Server..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "   Services Started Successfully!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: " -NoNewline; Write-Host "http://localhost:5173" -ForegroundColor Cyan
Write-Host "Database: " -NoNewline; Write-Host "http://localhost:8080" -ForegroundColor Cyan -NoNewline; Write-Host " (Adminer)"
Write-Host "API Docs: " -NoNewline; Write-Host "http://localhost:3000/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to stop all services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Stopping services..." -ForegroundColor Yellow
docker-compose down
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "All services stopped." -ForegroundColor Green
Read-Host "Press Enter to exit"