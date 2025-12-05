@echo off
echo Running RevHub Pipeline Manually...

REM Stop existing containers
echo Stopping existing containers...
docker rm -f backend frontend 2>nul

REM Build Docker images
echo Building Docker images...
docker build -t revhub-backend ./revHubBack
docker build -t revhub-frontend ./RevHub/RevHub

REM Start containers
echo Starting containers...
docker run -d --name backend --env-file backend.env.properties -p 8080:8080 revhub-backend
docker run -d --name frontend -p 4200:80 revhub-frontend

REM Check status
echo.
echo Checking container status...
docker ps

echo.
echo Deployment complete!
echo Frontend: http://localhost:4200
echo Backend: http://localhost:8080
echo.
pause