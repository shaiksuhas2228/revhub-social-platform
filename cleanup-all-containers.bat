@echo off
echo ========================================
echo Cleanup All Docker Containers
echo ========================================
echo.
echo This will:
echo - Stop all running containers
echo - Remove all containers
echo - Keep images (for faster rebuild)
echo.
pause

echo Stopping all containers...
docker stop $(docker ps -aq) 2>nul

echo Removing all containers...
docker rm $(docker ps -aq) 2>nul

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Jenkins will recreate containers on next build
echo Just click "Build Now" in Jenkins
echo.
pause
