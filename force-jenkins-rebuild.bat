@echo off
echo ========================================
echo Force Jenkins Clean Rebuild
echo ========================================
echo.
echo This will trigger Jenkins to do a fresh checkout
echo.
echo Steps to do manually in Jenkins:
echo 1. Go to http://localhost:9090/job/RevHubTeam7/
echo 2. Click "Build with Parameters" (or just "Build Now")
echo 3. Jenkins will pull latest code from GitHub
echo.
echo Alternative: Delete workspace and rebuild
echo 1. Go to http://localhost:9090/job/RevHubTeam7/ws/
echo 2. Click "Wipe Out Current Workspace"
echo 3. Click "Build Now"
echo.
pause
