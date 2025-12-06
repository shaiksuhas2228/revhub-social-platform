# RevHub MongoDB Fix - Quick Start Guide

## 🚀 Quick Fix (3 Steps)

### Step 1: Run Fix Script
```bash
cd "c:\RevHubTeam7 with jenkins\RevHubTeam7\RevProject\RevHub"
fix-mongodb-issues.bat
```

### Step 2: Restart Backend
```bash
cd revHubBack
mvn clean spring-boot:run
```

### Step 3: Test
- Open http://localhost:4200
- Login
- Try sending a message
- Try following a user
- Check notifications

## ✅ What This Fixes

- ✅ Chat messages not sending (400 error)
- ✅ Follow button not working (400 error)
- ✅ Notifications not loading (empty list)

## 🔍 Verify It's Working

### Check Backend Logs
You should see:
```
ChatService: Message saved with ID: ...
NotificationMongoService: ... notification saved with ID: ...
```

### Check Browser Console
You should NOT see:
```
❌ POST http://localhost:8080/chat/send 400 (Bad Request)
❌ POST http://localhost:8080/profile/follow/... 400
```

### Check Features
- ✅ Messages send and appear
- ✅ Follow button changes state
- ✅ Notifications appear in tab

## 🆘 Still Not Working?

### Option 1: Manual MongoDB Init
```bash
init-mongo.bat
```

### Option 2: Restart Everything
```bash
docker restart mongo-revhub
# Wait 10 seconds
# Restart backend (Ctrl+C then mvn spring-boot:run)
# Refresh browser (F5)
```

### Option 3: Check Detailed Guide
See `MONGODB_FIX.md` for comprehensive troubleshooting

## 📋 Common Issues

### "MongoDB container not found"
**Fix**: Script will create it automatically

### "Connection refused"
**Fix**: Wait 10 seconds after starting MongoDB, then restart backend

### "User not found"
**Fix**: Ensure both users are registered in the application

### Still getting 400 errors
**Fix**: 
1. Check backend logs for specific error
2. Verify MongoDB is running: `docker ps | findstr mongo`
3. Check collections exist: See MONGODB_FIX.md

## 📞 Need Help?

1. Check backend console for error messages
2. Check browser console for 400 errors
3. Review `MONGODB_FIX.md` for detailed troubleshooting
4. Review `FIXES_APPLIED.md` for what was changed

---

**That's it!** Run the fix script, restart backend, and test. Should take less than 2 minutes.
