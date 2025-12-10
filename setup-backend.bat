@echo off
echo ========================================
echo Setting up Backend
echo ========================================

cd backend

echo.
echo Checking if .env file exists...
if not exist .env (
    echo Creating .env file from env.example...
    copy env.example .env
    echo .env file created!
) else (
    echo .env file already exists, skipping...
)

echo.
echo Installing dependencies...
call npm install

echo.
echo Generating Prisma Client...
call npm run prisma:generate

echo.
echo Running database migrations...
call npm run prisma:migrate

echo.
echo ========================================
echo Backend setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure PostgreSQL is running (docker-compose up -d)
echo 2. Start backend: npm run start:dev
echo.
pause

