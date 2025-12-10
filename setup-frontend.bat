@echo off
echo ========================================
echo Setting up Frontend
echo ========================================

cd frontend

echo.
echo Checking if .env.local file exists...
if not exist .env.local (
    echo Creating .env.local file...
    echo NEXT_PUBLIC_API_URL=http://localhost:4000 > .env.local
    echo .env.local file created!
) else (
    echo .env.local file already exists, skipping...
)

echo.
echo Installing dependencies...
call npm install

echo.
echo ========================================
echo Frontend setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure backend is running
echo 2. Start frontend: npm run dev
echo.
pause

