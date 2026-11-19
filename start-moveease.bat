@echo off
setlocal
title MoveEase - Smart Home Relocation
echo.
echo ==========================================
echo        MoveEase - Project Launcher
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed.
  echo Install Node.js 18+ and run this file again.
  pause
  exit /b 1
)

echo [1/3] Installing backend dependencies...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 (
  echo Backend dependency installation failed.
  pause
  exit /b 1
)

echo.
echo [2/3] Starting backend...
start "MoveEase Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo Waiting for the backend API to become ready...
for /L %%i in (1,1,60) do (
  node -e "fetch('http://127.0.0.1:5000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))" >nul 2>nul
  if not errorlevel 1 goto backend_ready
  timeout /t 1 /nobreak >nul
)
echo ERROR: Backend did not become ready within 60 seconds.
echo Check the MoveEase Backend window for database or startup errors.
pause
exit /b 1

:backend_ready

echo.
echo [3/3] Installing frontend dependencies and starting frontend...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (
  echo Frontend dependency installation failed.
  pause
  exit /b 1
)
start "MoveEase Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo MoveEase is starting.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000/api/health
echo.
pause
