@echo off
setlocal

cd /d "%~dp0"

if /I "%~1"=="install" goto install
if /I "%~1"=="build" goto build
if /I "%~1"=="start" goto start_prod
if /I "%~1"=="typecheck" goto typecheck
if /I "%~1"=="dev" goto run
if /I "%~1"=="help" goto help
if /I "%~1"=="/?" goto help

goto run

:run
echo.
echo Starting app in development mode...
call :ensure_node_modules
if errorlevel 1 goto fail
call :generate_prisma
if errorlevel 1 goto fail

echo.
echo Launching Next.js dev server in a new window...
start "Saree Bazaar Dev Server" cmd /k "cd /d "%~dp0" && npm run dev"

echo Waiting for the app to respond on http://localhost:3000 ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$deadline=(Get-Date).AddSeconds(45); do { Start-Sleep -Seconds 1; try { $resp=Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 2; if ($resp.StatusCode -ge 200) { exit 0 } } catch {} } while ((Get-Date) -lt $deadline); exit 0"

echo Opening browser...
start "" "http://localhost:3000"
goto success

:install
echo.
echo Installing dependencies...
call npm install
if errorlevel 1 goto fail
call :generate_prisma
if errorlevel 1 goto fail
goto success

:build
echo.
echo Building production app...
call :ensure_node_modules
if errorlevel 1 goto fail
call :generate_prisma
if errorlevel 1 goto fail
call npm run build
if errorlevel 1 goto fail
goto success

:start_prod
echo.
echo Starting production server...
call :ensure_node_modules
if errorlevel 1 goto fail
call :generate_prisma
if errorlevel 1 goto fail
start "Saree Bazaar Production Server" cmd /k "cd /d "%~dp0" && npm run start"

echo Waiting for the app to respond on http://localhost:3000 ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$deadline=(Get-Date).AddSeconds(45); do { Start-Sleep -Seconds 1; try { $resp=Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 2; if ($resp.StatusCode -ge 200) { exit 0 } } catch {} } while ((Get-Date) -lt $deadline); exit 0"

echo Opening browser...
start "" "http://localhost:3000"
goto success

:typecheck
echo.
echo Running TypeScript type-check...
call :ensure_node_modules
if errorlevel 1 goto fail
call :generate_prisma
if errorlevel 1 goto fail
call npx tsc --noEmit
if errorlevel 1 goto fail
goto success

:help
echo.
echo Usage:
echo   run-project.bat           Start dev server and open browser
echo   run-project.bat dev       Start dev server and open browser
echo   run-project.bat install   Install dependencies and generate Prisma client
echo   run-project.bat build     Build the production app
echo   run-project.bat start     Start production server and open browser
echo   run-project.bat typecheck Run TypeScript type-check
goto end

:ensure_node_modules
if exist node_modules exit /b 0
echo.
echo node_modules not found. Installing dependencies first...
call npm install
if errorlevel 1 exit /b 1
exit /b 0

:generate_prisma
echo.
echo Generating Prisma client...
call npx prisma generate
if errorlevel 1 exit /b 1
exit /b 0

:success
echo.
echo Done.
goto end

:fail
echo.
echo Command failed. Review the output above.
exit /b 1

:end
endlocal