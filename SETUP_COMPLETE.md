# ✅ Complete Setup Guide - Get Your App Running!

## 🚀 Quick Start (Follow These Steps)

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

### Step 2: Start PostgreSQL Database

**Option A: Using Docker (Recommended)**
```bash
# From project root
docker-compose up -d
```

**Option B: Using Local PostgreSQL**
- Install PostgreSQL if not already installed
- Create database: `CREATE DATABASE patient_portal;`
- Update `backend/.env` with your connection string

---

### Step 3: Setup Backend Environment

1. **Create backend/.env file:**
   ```bash
   cd backend
   copy env.example .env
   ```
   
   Or manually create `backend/.env` with:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/patient_portal
   PORT=4000
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE_BYTES=10485760
   CORS_ORIGIN=http://localhost:3000
   ```

2. **Generate Prisma Client and Run Migrations:**
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   ```

---

### Step 4: Setup Frontend Environment

✅ **Already Created:** `frontend/.env.local` exists with:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**No action needed** - the file is already configured!

---

### Step 5: Start the Application

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

### Step 6: Open Your Browser

Navigate to: **http://localhost:3000**

You should see the Patient Document Portal!

---

## ✅ Verification Checklist

Before running, verify:

- [ ] PostgreSQL is running (docker-compose up -d)
- [ ] `backend/.env` file exists with correct DATABASE_URL
- [ ] `frontend/.env.local` file exists (✅ Already created!)
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Prisma migrations run (`cd backend && npm run prisma:migrate`)

---

## 🐛 Troubleshooting

### If Backend Won't Start:

1. **Check PostgreSQL is running:**
   ```bash
   docker-compose ps
   ```

2. **Check backend/.env exists:**
   ```bash
   cd backend
   cat .env
   ```

3. **Verify database connection:**
   ```bash
   cd backend
   npm run prisma:studio
   ```
   Should open Prisma Studio in browser

---

### If Frontend Shows "Failed to fetch":

1. **Verify backend is running** on port 4000
2. **Check frontend/.env.local:**
   ```bash
   cd frontend
   cat .env.local
   ```
   Should show: `NEXT_PUBLIC_API_URL=http://localhost:4000`

3. **Restart frontend** (Ctrl+C then `npm run dev`)

4. **Hard refresh browser** (Ctrl+Shift+R)

---

### If Database Connection Fails:

1. **Check docker-compose:**
   ```bash
   docker-compose ps
   ```
   Should show postgres container running

2. **Check DATABASE_URL in backend/.env:**
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/patient_portal
   ```

3. **Test connection:**
   ```bash
   cd backend
   npx prisma db pull
   ```

---

## 📋 All Commands Summary

```bash
# 1. Install dependencies
cd backend && npm install && cd ../frontend && npm install

# 2. Start database
docker-compose up -d

# 3. Setup backend
cd backend
copy env.example .env  # Windows
# OR: cp env.example .env  # Mac/Linux
npm run prisma:generate
npm run prisma:migrate

# 4. Start backend (Terminal 1)
npm run start:dev

# 5. Start frontend (Terminal 2)
cd ../frontend
npm run dev

# 6. Open browser
# Go to: http://localhost:3000
```

---

## 🎯 Expected Behavior

When everything is working:

1. **Backend Terminal:**
   ```
   🌐 CORS enabled for origin: http://localhost:3000
   Application is running on: http://localhost:4000
   ```

2. **Frontend Terminal:**
   ```
   ▲ Next.js 14.0.4
   - Local:        http://localhost:3000
   ```

3. **Browser Console (F12):**
   ```
   🔗 API URL: http://localhost:4000
   📥 GET URL: http://localhost:4000/api/documents
   ```

4. **Browser:** You can upload PDF files, view them, download, and delete!

---

## 🆘 Still Having Issues?

Share:
1. Error messages from backend terminal
2. Error messages from frontend terminal  
3. Browser console errors (F12)
4. What step you're stuck on

