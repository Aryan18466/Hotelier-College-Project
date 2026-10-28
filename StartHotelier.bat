@echo off
setlocal EnableExtensions
title Hotelier Launcher

set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"

echo ========================================================
echo                 HOTELIER LAUNCHER
echo ========================================================
echo Project: "%PROJECT_DIR%"
echo.
echo This launcher does not try to start MongoDB.
echo The backend must be able to reach the database configured
echo in backend\.env (local MongoDB or a configured remote URI).
echo.

if not exist "%BACKEND_DIR%\package.json" goto BACKEND_MISSING
if not exist "%FRONTEND_DIR%\package.json" goto FRONTEND_MISSING

where node >nul 2>&1
if errorlevel 1 goto NODE_MISSING

where npm >nul 2>&1
if errorlevel 1 goto NPM_MISSING

echo Checking backend port 5000...
powershell -NoProfile -Command "$x = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue; if ($x) { exit 0 } else { exit 1 }" >nul 2>&1
if not errorlevel 1 (
    echo Backend port 5000 is already listening. Skipping backend startup.
) else (
    echo Starting Hotelier backend...
    start "Hotelier Backend [Port 5000]" /D "%BACKEND_DIR%" cmd /k "npm start"
    timeout /t 2 /nobreak >nul
)

echo.
echo Checking frontend port 5173...
powershell -NoProfile -Command "$x = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue; if ($x) { exit 0 } else { exit 1 }" >nul 2>&1
if not errorlevel 1 (
    echo Frontend port 5173 is already listening. Skipping frontend startup.
) else (
    echo Starting Hotelier frontend...
    start "Hotelier Frontend [Port 5173]" /D "%FRONTEND_DIR%" cmd /k "npm run dev"
    timeout /t 2 /nobreak >nul
)

echo.
echo Startup commands have been requested. Check the service windows for errors.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo If the backend reports a MongoDB connection error, verify MONGODB_URI
echo in backend\.env and make sure that database is available.
echo If either port was already occupied, this launcher skipped that service
echo to avoid starting a duplicate instance.
echo.
pause
goto END

:BACKEND_MISSING
echo ERROR: backend\package.json was not found in this project folder.
pause
goto END

:FRONTEND_MISSING
echo ERROR: frontend\package.json was not found in this project folder.
pause
goto END

:NODE_MISSING
echo ERROR: Node.js was not found in PATH. Install Node.js or fix PATH.
pause
goto END

:NPM_MISSING
echo ERROR: npm was not found in PATH. Repair or reinstall Node.js.
pause
goto END

:END
endlocal
