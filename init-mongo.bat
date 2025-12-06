@echo off
echo ========================================
echo Initializing MongoDB for RevHub
echo ========================================
echo.

echo Checking if MongoDB container is running...
docker ps | findstr mongo-revhub

if %ERRORLEVEL% NEQ 0 (
    echo MongoDB container not running. Starting it...
    docker start mongo-revhub || docker run -d --name mongo-revhub -p 27017:27017 mongo:latest
    timeout /t 10
)

echo.
echo Initializing MongoDB database and collections...
docker exec -i mongo-revhub mongosh < init-mongodb.js

echo.
echo ========================================
echo MongoDB Initialization Complete!
echo ========================================
echo.
echo You can now start the backend server.
echo.
pause
