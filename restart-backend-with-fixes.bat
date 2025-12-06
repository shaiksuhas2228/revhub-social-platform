@echo off
echo ========================================
echo Restarting Backend with MongoDB Fixes
echo ========================================

echo Step 1: Initialize MongoDB...
call fix-mongodb-issues.bat

echo.
echo Step 2: Rebuild backend container...
docker rm -f backend
docker build -t revhub-backend ./revHubBack

echo.
echo Step 3: Start backend with MongoDB connection...
docker run -d --name backend --env-file backend.env.properties -p 8080:8080 revhub-backend

echo.
echo Step 4: Wait for backend to start...
timeout /t 15

echo.
echo Step 5: Check backend logs...
docker logs backend --tail 50

echo.
echo ========================================
echo Backend restarted! Test chat now.
echo ========================================
pause
