@echo off
echo Building RevHub Docker containers...

REM Build images
docker build -t revhub-backend ./revHubBack
docker build -t revhub-frontend ./RevHub/RevHub

REM Remove old containers
docker rm -f backend 2>nul
docker rm -f frontend 2>nul

REM Start new containers
echo Starting backend container...
docker run -d --name backend --env-file backend.env.properties -p 8080:8080 revhub-backend

echo Starting frontend container...
docker run -d --name frontend -p 4200:80 revhub-frontend

echo.
echo Deployment complete!
echo Frontend: http://localhost:4200
echo Backend: http://localhost:8080