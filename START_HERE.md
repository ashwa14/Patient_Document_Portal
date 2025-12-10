# 🚀 START HERE - Complete Setup Instructions

## ⚡ Quick Setup (Windows)

I've created setup scripts for you! Run these:

### Option 1: Automatic Setup (Recommended)

**Double-click:** `setup-all.bat`

This will:
1. Start PostgreSQL database
2. Setup backend (create .env, install dependencies, run migrations)
3. Setup frontend (create .env.local, install dependencies)

### Option 2: Manual Setup

**Step 1:** Start PostgreSQL
```bash
docker-compose up -d
```

**Step 2:** Setup Backend
```bash
setup-backend.bat
```

**Step 3:** Setup Frontend
```bash
setup-frontend.bat
```

---

## 📋 Manual Setup Steps (If scripts don't work)

### 1. Start PostgreSQL Database

```bash
docker-compose up -d
```

Wait for it to start (should see "Container patient_portal_db started")

---

### 2. Setup Backend

**Create `.env` file:**
```bash
cd backend
copy env.example .env
```

**Install dependencies:**
```bash
npm install
```

**Setup database:**
```bash
npm run prisma:generate
npm run prisma:migrate
```

---

### 3. Setup Frontend

**Create `.env.local` file:**
```bash
cd frontend
echo NEXT_PUBLIC_API_URL=http://localhost:4000 > .env.local
```

**Install dependencies:**
```bash
npm install
```

---

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

You should see:
```
🌐 CORS enabled for origin: http://localhost:3000
Application is running on: http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
```

---

### 5. Open Browser

Navigate to: **http://localhost:3000**

---

## ✅ What You Need to Do Externally

### Prerequisites (Install if you don't have them):

1. **Node.js 18+**
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **Docker Desktop** (for PostgreSQL)
   - Download from: https://www.docker.com/products/docker-desktop
   - Verify: `docker --version`

3. **Git** (optional, if cloning)
   - Download from: https://git-scm.com/

### After Setup:

1. **Start PostgreSQL:** `docker-compose up -d`
2. **Start Backend:** `cd backend && npm run start:dev`
3. **Start Frontend:** `cd frontend && npm run dev`
4. **Open Browser:** http://localhost:3000

---

## 🐛 Common Issues & Fixes

### Issue: "docker-compose: command not found"
**Fix:** Install Docker Desktop and restart terminal

### Issue: "npm: command not found"
**Fix:** Install Node.js from https://nodejs.org/

### Issue: "Port 4000 already in use"
**Fix:** Change PORT in `backend/.env` to another port (e.g., 4001)

### Issue: "Port 3000 already in use"
**Fix:** 
```bash
cd frontend
npm run dev -- -p 3001
```

### Issue: Database connection error
**Fix:** 
1. Make sure Docker is running
2. Check: `docker-compose ps` (should show postgres running)
3. Verify `backend/.env` has correct DATABASE_URL

### Issue: "Failed to fetch" in browser
**Fix:**
1. Make sure backend is running (check terminal)
2. Verify `frontend/.env.local` exists with correct URL
3. Restart frontend: Stop (Ctrl+C) then `npm run dev` again

---

## 📁 File Structure

After setup, you should have:

```
INI8 Labs Assignment/
├── backend/
│   ├── .env                    ← Created by setup script
│   ├── src/
│   ├── prisma/
│   └── uploads/
├── frontend/
│   ├── .env.local              ← Created by setup script
│   └── app/
├── docker-compose.yml
└── setup-all.bat              ← Run this!
```

---

## 🎯 Success Indicators

When everything works:

✅ Backend terminal shows:
```
🌐 CORS enabled for origin: http://localhost:3000
Application is running on: http://localhost:4000
```

✅ Frontend terminal shows:
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
```

✅ Browser console (F12) shows:
```
🔗 API URL: http://localhost:4000
```

✅ You can upload PDF files, view them, download, and delete!

---

## 🆘 Still Need Help?

1. Check `SETUP_COMPLETE.md` for detailed troubleshooting
2. Check `TROUBLESHOOTING.md` for API connection issues
3. Share error messages from:
   - Backend terminal
   - Frontend terminal
   - Browser console (F12)

