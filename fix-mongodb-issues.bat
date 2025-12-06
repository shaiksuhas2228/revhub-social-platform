@echo off
echo ========================================
echo RevHub MongoDB Quick Fix Script
echo ========================================
echo.

echo Step 1: Checking MongoDB container...
docker ps -a | findstr mongo-revhub
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB container not found. Creating it...
    docker run -d --name mongo-revhub -p 27017:27017 mongo:latest
    timeout /t 15
) else (
    echo MongoDB container exists. Ensuring it's running...
    docker start mongo-revhub 2>nul
    timeout /t 5
)

echo.
echo Step 2: Initializing MongoDB database...
docker exec -i mongo-revhub mongosh revhubteam4 --eval "db.createCollection('chatMessage'); db.createCollection('notificationMongo'); db.chatMessage.createIndex({'senderId': 1, 'receiverId': 1, 'timestamp': -1}); db.chatMessage.createIndex({'senderUsername': 1, 'receiverUsername': 1}); db.notificationMongo.createIndex({'userId': 1, 'createdDate': -1}); db.notificationMongo.createIndex({'userId': 1, 'readStatus': 1}); print('MongoDB initialized successfully!');"

echo.
echo Step 3: Verifying MongoDB setup...
docker exec -i mongo-revhub mongosh revhubteam4 --eval "print('Collections: ' + db.getCollectionNames()); print('Chat messages: ' + db.chatMessage.find().count()); print('Notifications: ' + db.notificationMongo.find().count());"

echo.
echo ========================================
echo MongoDB Fix Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your backend server (mvn spring-boot:run)
echo 2. Refresh your frontend (F5)
echo 3. Try sending a message or following a user
echo.
echo If issues persist, check MONGODB_FIX.md for detailed troubleshooting
echo.
pause
