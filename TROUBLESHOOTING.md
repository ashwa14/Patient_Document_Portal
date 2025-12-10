# Troubleshooting "Failed to fetch" Error

## Quick Diagnostic Checklist

### ✅ Step 1: Verify Environment Variable File Exists

**Location:** `frontend/.env.local`

**Content MUST be:**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**⚠️ CRITICAL:** 
- File name MUST be `.env.local` (not `.env`, not `env.example`)
- Variable MUST start with `NEXT_PUBLIC_` prefix
- NO trailing slash after the URL
- NO quotes around the URL

### ✅ Step 2: Restart Next.js Dev Server

After creating/editing `.env.local`:
1. **Stop** the frontend server (Ctrl+C)
2. **Restart** it: `npm run dev`
3. **Hard refresh** browser (Ctrl+Shift+R or Cmd+Shift+R)

**Why?** Next.js only loads env vars on startup!

### ✅ Step 3: Verify Backend is Running

Check backend terminal - should show:
```
Application is running on: http://localhost:4000
```

Test backend directly:
```bash
curl http://localhost:4000/api/documents
```

Should return `[]` (empty array) or JSON, NOT "connection refused"

### ✅ Step 4: Check Browser Console

Open DevTools (F12) → Console tab

**Look for:**
- 🔗 API URL: `http://localhost:4000` (should match)
- 📥 GET URL: `http://localhost:4000/api/documents` (should match)

## Common Error Types & Fixes

### 🔴 Error: "Failed to fetch" or "NetworkError"
**Cause:** Frontend can't reach backend

**Fix:**
1. Backend not running → Start it: `cd backend && npm run start:dev`
2. Wrong port → Check backend is on port 4000
3. Wrong URL → Verify `.env.local` has correct URL

---

### 🟡 Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Cause:** Backend CORS not configured correctly

**Fix:**
Check `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:3000',  // Must match frontend URL
  credentials: true,
});
```

Or use environment variable:
```typescript
const corsOrigin = configService.get('CORS_ORIGIN') || 'http://localhost:3000';
app.enableCors({
  origin: corsOrigin,
  credentials: true,
});
```

**Restart backend after changing CORS settings!**

---

### 🟠 Error: "404 Not Found" or "Cannot GET /api/documents"
**Cause:** Wrong URL path

**Expected URLs:**
- ✅ `http://localhost:4000/api/documents` (GET all)
- ✅ `http://localhost:4000/api/documents/upload` (POST upload)
- ✅ `http://localhost:4000/api/documents/1` (GET/DELETE by ID)

**NOT:**
- ❌ `http://localhost:4000/documents` (missing /api prefix)
- ❌ `http://localhost:3000/api/documents` (wrong port - frontend port)

**Fix:**
Ensure `frontend/lib/api.ts` uses:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
// Then: `${API_URL}/api/documents` ✅
```

---

### 🔵 Error: "Connection refused" or "ERR_CONNECTION_REFUSED"
**Cause:** Backend is not running or wrong port

**Fix:**
1. Start backend: `cd backend && npm run start:dev`
2. Check port in `backend/.env`: `PORT=4000`
3. Verify no other app is using port 4000:
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :4000
   ```

---

### 🟣 Error: "TypeError: Failed to fetch" (in console)
**Cause:** Multiple possible issues

**Debug steps:**
1. Open browser DevTools → Network tab
2. Try making a request
3. Check the failed request:
   - **Status:** What HTTP status code?
   - **URL:** What exact URL was called?
   - **Response:** What error message?

**Common fixes:**
- Check `.env.local` file exists and is correct
- Restart Next.js dev server
- Check backend logs for errors
- Verify CORS configuration

---

## Step-by-Step Debugging

### 1. Test Backend Directly (curl/Postman)

```bash
# Test GET all documents
curl http://localhost:4000/api/documents

# Test POST upload (if you have a test.pdf)
curl -X POST http://localhost:4000/api/documents/upload \
  -F "file=@test.pdf"
```

**Expected:** JSON response (not error)

If this fails → Backend issue, not frontend!

---

### 2. Check Frontend Environment Variable

In browser console (F12), type:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

**Expected:** `http://localhost:4000`

**If `undefined`:**
- `.env.local` file missing or wrong name
- Variable name wrong (must start with `NEXT_PUBLIC_`)
- Next.js server not restarted

---

### 3. Check Network Tab

1. Open DevTools → Network tab
2. Try loading documents
3. Find the failed request
4. Click on it → Check:
   - **Request URL:** Should be `http://localhost:4000/api/documents`
   - **Status:** What error code?
   - **Response:** What error message?

---

### 4. Check Backend Logs

Look at backend terminal output:
- Any error messages?
- Is CORS being applied?
- Is the route being hit?

If route is NOT hit → CORS or URL issue
If route IS hit but errors → Backend code issue

---

## Complete Fix Checklist

- [ ] `frontend/.env.local` exists with `NEXT_PUBLIC_API_URL=http://localhost:4000`
- [ ] Frontend dev server restarted after creating `.env.local`
- [ ] Backend is running on port 4000
- [ ] Backend CORS allows `http://localhost:3000`
- [ ] Browser console shows correct API URL
- [ ] Network tab shows correct request URL
- [ ] No firewall blocking localhost connections
- [ ] No antivirus blocking localhost connections

---

## Still Not Working?

**Share these details:**
1. **Browser console error** (full text)
2. **Network tab request details:**
   - Request URL
   - Status code
   - Response body
3. **Backend terminal logs** (any errors?)
4. **Content of `frontend/.env.local`** (hide sensitive data)
5. **Content of `backend/.env`** (hide sensitive data)

