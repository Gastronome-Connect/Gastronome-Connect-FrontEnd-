# Signup Errors - Troubleshooting Guide

## Current Errors

### 1. ❌ 404 Not Found - `/api/check-email`
The email validation endpoint is returning 404, meaning:
- Endpoint doesn't exist on backend
- Wrong route path on backend
- Backend not running

**Fix**: Verify backend has this route:
```javascript
// Backend should have:
POST /api/check-email
// Accept: { email: "user@example.com" }
// Return: { available: true/false } or similar
```

---

### 2. ❌ CORS Policy Error - `/api/send-otp`
Your frontend is being blocked from calling the backend due to missing CORS headers.

**Fix in Backend**:
```javascript
// If using Express.js:
const cors = require('cors');

app.use(cors({
  origin: [
    'https://gastronomcconnect.online',    // Your production frontend
    'http://localhost:3000',                // Local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// Add BEFORE other middleware and routes
```

---

### 3. ❌ 582 Bad Gateway - `/api/send-otp`
The backend server is experiencing issues or isn't properly configured.

**Causes**:
- Backend server is down
- Backend deployment error
- Nginx/load balancer configuration issue
- Database connection failing

**Fix**:
1. Check if backend is running: `curl https://api.gastronomeconnect.online/api/health`
2. Review backend logs for errors
3. Check if all dependencies are installed
4. Verify database connection is working

---

## Signup Flow Architecture

The correct flow should be:
```
1. User enters email, username, password in AuthPage
   ↓
2. Frontend: POST /api/check-email { email }
   Backend: Verify email not in use
   ↓
3. Frontend: POST /api/send-otp { email, username, password }
   Backend: Create PendingUser, generate OTP, send email
   ↓
4. Navigate to /verification page
   ↓
5. User enters OTP
   Frontend: POST /api/verify-otp { email, otp }
   Backend: Verify OTP, mark user verified
   ↓
6. Navigate to preferences/allergens pages (optional)
   ↓
7. Complete signup
   Frontend: POST /api/complete-signup { email, preferences, allergens }
   Backend: Create actual User account from PendingUser
   ↓
8. Redirect to login page
```

---

## Debug Checklist

### Frontend Side ✅
- [x] Error handling improved with better status codes
- [x] Network error reporting added
- [x] Fallback endpoints configured

### Backend Side ⚠️
- [ ] Verify `/api/check-email` endpoint exists
- [ ] Verify `/api/send-otp` endpoint exists
- [ ] Verify `/api/verify-otp` endpoint exists
- [ ] Verify `/api/complete-signup` endpoint exists
- [ ] CORS headers configured
- [ ] Backend server is running
- [ ] Database connection is working
- [ ] Email service is configured (OTP sending)

---

## Test Backend Endpoints

Use curl or Postman to test:

```bash
# Test 1: Check email availability
curl -X POST https://api.gastronomeconnect.online/api/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Expected response:
# 200 OK: { "available": true/false, "message": "..." }
# 404: Endpoint doesn't exist
# 582: Server error

# Test 2: Health check (to verify backend is running)
curl https://api.gastronomeconnect.online/api/health

# Expected: 200 OK with some response
```

---

## Frontend Improvements Applied ✅

I've updated `src/userAuth/AuthPage.jsx` with:
1. **Better error messages** - Shows HTTP status codes
2. **Network error handling** - Catches fetch failures
3. **Improved logging** - Logs errors to console for debugging
4. **Error messages flow** - Shows specific field errors when possible

Now when signup fails, you'll see clearer messages like:
- "Backend error 404: Failed to send OTP"
- "Network error: Failed to send OTP"
- "Email check failed - backend may be down"

---

## Next Steps

1. **Verify backend is deployed** and running at `https://api.gastronomeconnect.online`
2. **Configure CORS** on backend for your frontend origin
3. **Test endpoints** using curl/Postman
4. **Check backend logs** for any errors
5. **Verify database** is connected and working
6. **Check email service** is configured for OTP sending
7. **Test signup flow** end-to-end

If issues persist, share:
- Backend error logs
- Output of health check endpoint
- Backend's CORS configuration
- Backend's signup endpoint implementations
