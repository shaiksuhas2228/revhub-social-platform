@echo off
echo ========================================
echo RevHub Complete Setup Script
echo ========================================
echo.

echo Step 1: Starting MySQL...
docker run -d --name mysql-revhub -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=revhubteam7 -p 3306:3306 mysql:8.0
timeout /t 10

echo Step 2: Starting MongoDB...
docker run -d --name mongo-revhub -p 27017:27017 mongo:latest
timeout /t 5

echo Step 3: Verifying databases...
docker ps | findstr mysql
docker ps | findstr mongo

echo.
echo Step 4: Create Jenkins Pipeline Job
echo Go to: http://localhost:9090
echo Click: New Item > RevHub-Pipeline > Pipeline
echo Configure:
echo   - Pipeline script from SCM
echo   - Git: https://github.com/shaiksuhas2228/revhub-social-platform.git
echo   - Branch: */version1
echo   - Script Path: Jenkinsfile
echo.
echo Step 5: Click "Build Now"
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo MySQL: localhost:3306 (root/root)
echo MongoDB: localhost:27017
echo Jenkins: http://localhost:9090
echo.
echo After Jenkins build:
echo Frontend: http://localhost:4200
echo Backend: http://localhost:8080
echo ========================================
pause
