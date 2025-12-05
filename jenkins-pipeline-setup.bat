@echo off
echo RevHub Jenkins Pipeline Setup Guide
echo ====================================
echo.
echo 1. Open Jenkins at http://localhost:8081
echo 2. Login with admin credentials
echo 3. Go to "New Item"
echo 4. Enter name: RevHub-Pipeline
echo 5. Select "Pipeline" and click OK
echo.
echo Pipeline Configuration:
echo - Definition: Pipeline script from SCM
echo - SCM: Git
echo - Repository URL: https://github.com/shaiksuhas2228/revhub-social-platform.git
echo - Branch: */version1
echo - Script Path: Jenkinsfile
echo.
echo 6. Click "Save"
echo 7. Click "Build Now"
echo.
echo After successful build:
echo - Frontend: http://localhost:4200
echo - Backend: http://localhost:8080
echo.
pause