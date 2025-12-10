# Quick Start Guide

## Prerequisites
- Node.js 18+
- Docker Desktop (for PostgreSQL)

## Steps to Run

### 1. Start Database
```bash
docker-compose up -d
```

### 2. Setup Backend
```bash
cd backend
npm install
cp env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

### 3. Setup Frontend (new terminal)
```bash
cd frontend
npm install
cp env.example .env.local
npm run dev
```

### 4. Open Browser
Navigate to: http://localhost:3000

## Environment Files

- Backend: Copy `backend/env.example` to `backend/.env`
- Frontend: Copy `frontend/env.example` to `frontend/.env.local`

See README.md for detailed instructions and troubleshooting.

