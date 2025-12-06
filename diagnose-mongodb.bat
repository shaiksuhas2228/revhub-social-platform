@echo off
echo ========================================
echo MongoDB Connection Diagnostics
echo ========================================
echo.

echo 1. Checking MongoDB container status...
docker ps -a | findstr mongo-revhub
echo.

echo 2. Testing MongoDB connection from host...
docker exec mongo-revhub mongosh revhubteam4 --eval "db.stats()"
echo.

echo 3. Checking collections...
docker exec mongo-revhub mongosh revhubteam4 --eval "db.getCollectionNames()"
echo.

echo 4. Checking if backend container exists...
docker ps -a | findstr backend
echo.

echo 5. Testing host.docker.internal resolution...
docker run --rm alpine ping -c 2 host.docker.internal
echo.

echo 6. Checking backend.env.properties...
type backend.env.properties
echo.

echo ========================================
echo Diagnostics Complete
echo ========================================
pause
