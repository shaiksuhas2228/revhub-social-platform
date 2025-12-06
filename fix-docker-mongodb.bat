@echo off
echo ========================================
echo Fix MongoDB Connection for Docker
echo ========================================
echo.

echo Step 1: Create Docker network...
docker network create revhub-network 2>nul || echo "Network already exists"
echo.

echo Step 2: Stop and remove old containers...
docker rm -f backend frontend mongo-revhub 2>nul
echo.

echo Step 3: Start MongoDB on network...
docker run -d --name mongo-revhub --network revhub-network -p 27017:27017 mongo:latest
timeout /t 15
echo.

echo Step 4: Initialize MongoDB...
docker exec mongo-revhub mongosh revhubteam4 --eval "db.createCollection('chatMessage'); db.createCollection('notificationMongo'); db.chatMessage.createIndex({'senderId': 1, 'receiverId': 1, 'timestamp': -1}); db.notificationMongo.createIndex({'userId': 1, 'createdDate': -1});"
echo.

echo Step 5: Update backend.env.properties...
echo # Spring profile > backend.env.properties
echo SPRING_PROFILES_ACTIVE=prod >> backend.env.properties
echo. >> backend.env.properties
echo # Database connection >> backend.env.properties
echo DB_URL=jdbc:mysql://host.docker.internal:3306/revhubteam7?useSSL=false^&allowPublicKeyRetrieval=true >> backend.env.properties
echo DB_USER=root >> backend.env.properties
echo DB_PASS=root >> backend.env.properties
echo. >> backend.env.properties
echo # MongoDB - Use container name on same network >> backend.env.properties
echo MONGO_URI=mongodb://mongo-revhub:27017/revhubteam4 >> backend.env.properties
echo.

echo Step 6: Build backend image...
docker build -t revhub-backend ./revHubBack
echo.

echo Step 7: Start backend on network...
docker run -d --name backend --network revhub-network --env-file backend.env.properties -p 8080:8080 revhub-backend
echo.

echo Step 8: Wait for backend to start...
timeout /t 20
echo.

echo Step 9: Check backend logs...
docker logs backend --tail 30
echo.

echo ========================================
echo Fix Complete!
echo ========================================
echo MongoDB: mongodb://localhost:27017/revhubteam4
echo Backend: http://localhost:8080
echo.
echo Check logs: docker logs backend
echo ========================================
pause
