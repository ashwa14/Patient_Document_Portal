@echo off
echo ========================================
echo Complete Project Setup
echo ========================================
echo.

echo Step 1: Starting PostgreSQL database...
docker-compose up -d
echo.

echo Step 2: Setting up backend...
call setup-backend.bat
echo.

echo Step 3: Setting up frontend...
call setup-frontend.bat
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo 1. Terminal 1 - Backend: cd backend ^&^& npm run start:dev
echo 2. Terminal 2 - Frontend: cd frontend ^&^& npm run dev
echo 3. Open browser: http://localhost:3000
echo.
pause

