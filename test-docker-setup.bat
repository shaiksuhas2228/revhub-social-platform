@echo off
echo Testing Docker MongoDB Setup...
echo.

echo 1. Creating network...
docker network create revhub-network 2>nul

echo 2. Starting MongoDB...
docker run -d --name mongo-test --network revhub-network -p 27018:27017 mongo:latest
timeout /t 10

echo 3. Testing connection from another container...
docker run --rm --network revhub-network mongo:latest mongosh mongodb://mongo-test:27017/test --eval "db.stats()"

echo 4. Cleanup...
docker rm -f mongo-test

echo.
echo Test complete! If you saw MongoDB stats, the network setup works.
pause
