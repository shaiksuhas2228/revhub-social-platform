@echo off
echo ========================================
echo Delete All Docker Containers
echo ========================================
echo.
echo WARNING: This will delete ALL containers!
echo.
pause

echo.
echo Stopping all containers...
FOR /f "tokens=*" %%i IN ('docker ps -q') DO docker stop %%i

echo.
echo Removing all containers...
FOR /f "tokens=*" %%i IN ('docker ps -aq') DO docker rm -f %%i

echo.
echo ========================================
echo All containers deleted!
echo ========================================
echo.
echo Next steps:
echo 1. Go to Jenkins: http://localhost:9090
echo 2. Click "Build Now" on your job
echo 3. Jenkins will recreate all containers
echo.
pause
