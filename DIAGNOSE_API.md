# Step-by-Step API Connection Diagnosis

## 🔍 IMMEDIATE CHECKS (Do These First!)

### ✅ CHECK 1: Verify `.env.local` File Exists

**File location:** `frontend/.env.local` (NOT `.env`, NOT `env.example`)

**File MUST contain:**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Common mistakes:**
- ❌ File named `.env` instead of `.env.local`
- ❌ Variable missing `NEXT_PUBLIC_` prefix
- ❌ Has trailing slash: `http://localhost:4000/` (WRONG!)
- ❌ Has quotes: `"http://localhost:4000"` (WRONG!)

---

### ✅ CHECK 2: Restart Frontend Dev Server

**CRITICAL:** Next.js only loads environment variables on startup!

1. Stop frontend server (Ctrl+C)
2. Start it again: `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R)

---

### ✅ CHECK 3: Verify Backend is Running

Check backend terminal output. Should see:
```
Application is running on: http://localhost:4000
🌐 CORS enabled for origin: http://localhost:3000
```

**Test backend directly:**
```bash
curl http://localhost:4000/api/documents
```

**Expected response:**
- ✅ `[]` (empty array) or JSON array = Backend working!
- ❌ "Connection refused" = Backend not running
- ❌ "404" = Wrong URL or backend route issue

---

### ✅ CHECK 4: Check Browser Console

Open browser DevTools (F12) → Console tab

**After page loads, you should see:**
```
🔗 API URL: http://localhost:4000
```

**If you see `undefined` or wrong URL:**
- `.env.local` file is wrong or missing
- Frontend server wasn't restarted

---

### ✅ CHECK 5: Check Network Tab

1. Open DevTools → Network tab
2. Try loading the page or uploading a file
3. Look for failed requests (red status)
4. Click on the failed request

**Check Request URL:**
- ✅ Should be: `http://localhost:4000/api/documents`
- ❌ `http://localhost:3000/api/documents` = Wrong! (using frontend port)
- ❌ `undefined/api/documents` = Environment variable not loaded
- ❌ `http://localhost:4000/documents` = Missing `/api` prefix

**Check Status Code:**
- `(failed)` or `net::ERR_FAILED` = Connection issue
- `404` = Route not found
- `405` = Method not allowed
- `500` = Backend error
- `CORS error` = CORS configuration issue

---

## 🐛 COMMON ERROR SCENARIOS

### Scenario 1: "Failed to fetch" with Network Error

**Symptoms:**
- Browser console: `TypeError: Failed to fetch`
- Network tab: Status `(failed)` or `net::ERR_FAILED`

**Possible Causes:**
1. Backend not running
2. Wrong URL in `.env.local`
3. Firewall blocking localhost
4. Backend crashed

**Fix:**
1. Check backend terminal for errors
2. Verify backend is on port 4000: `curl http://localhost:4000/api/documents`
3. Check `.env.local` file exists and has correct URL
4. Restart both frontend and backend

---

### Scenario 2: CORS Error

**Symptoms:**
- Browser console: `Access to fetch at 'http://localhost:4000/...' from origin 'http://localhost:3000' has been blocked by CORS policy`
- Network tab: Status `CORS error` or `0`

**Fix:**

1. Check `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:3000',  // Must match frontend URL
  credentials: true,
});
```

2. OR use environment variable in `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

3. **Restart backend** after changing CORS settings!

---

### Scenario 3: 404 Not Found

**Symptoms:**
- Network tab: Status `404`
- Response: `{"statusCode":404,"message":"Cannot GET /documents"}`

**Cause:** Wrong URL path - missing `/api` prefix

**Fix:**

Check `frontend/lib/api.ts` - URLs should be:
```typescript
const API_URL = 'http://localhost:4000'  // No trailing slash!
fetch(`${API_URL}/api/documents`)  // ✅ Correct
fetch(`${API_URL}/documents`)      // ❌ Wrong - missing /api
```

---

### Scenario 4: Connection Refused

**Symptoms:**
- Network tab: `ERR_CONNECTION_REFUSED`
- Browser console: `Failed to fetch`

**Causes:**
1. Backend not running
2. Backend on wrong port
3. Port 4000 blocked by firewall

**Fix:**
1. Start backend: `cd backend && npm run start:dev`
2. Verify port in `backend/.env`: `PORT=4000`
3. Check if port is in use:
   ```bash
   # Windows
   netstat -ano | findstr :4000
   ```

---

## 🔧 VERIFICATION CHECKLIST

Run through this checklist:

- [ ] `frontend/.env.local` exists with `NEXT_PUBLIC_API_URL=http://localhost:4000`
- [ ] Frontend dev server restarted after creating `.env.local`
- [ ] Browser console shows: `🔗 API URL: http://localhost:4000`
- [ ] Backend terminal shows: `Application is running on: http://localhost:4000`
- [ ] Backend terminal shows: `🌐 CORS enabled for origin: http://localhost:3000`
- [ ] `curl http://localhost:4000/api/documents` returns JSON (not error)
- [ ] Network tab shows request URL: `http://localhost:4000/api/documents`
- [ ] No CORS errors in browser console
- [ ] No "connection refused" errors

---

## 🚀 QUICK FIX COMMANDS

If everything seems wrong, try this reset:

```bash
# 1. Stop both servers (Ctrl+C)

# 2. Verify backend .env
cd backend
cat .env  # Should show DATABASE_URL, PORT=4000, CORS_ORIGIN=http://localhost:3000

# 3. Start backend
npm run start:dev

# 4. In new terminal - Verify frontend .env.local
cd frontend
cat .env.local  # Should show NEXT_PUBLIC_API_URL=http://localhost:4000

# 5. Start frontend
npm run dev

# 6. Open browser to http://localhost:3000
# 7. Open DevTools (F12) → Console tab
# 8. Check for 🔗 API URL log
```

---

## 📋 WHAT TO SHARE IF STILL BROKEN

If still having issues, share:

1. **Browser Console Output:**
   - Copy all error messages

2. **Network Tab Details:**
   - Request URL
   - Status code
   - Response body

3. **Backend Terminal Output:**
   - Any error messages?
   - Does it show CORS enabled?

4. **Environment Files (hide sensitive data):**
   - Content of `frontend/.env.local`
   - Content of `backend/.env`

5. **Test Results:**
   - Output of `curl http://localhost:4000/api/documents`

