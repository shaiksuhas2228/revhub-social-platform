@echo off
echo ========================================
echo Creating Jenkins Pipeline for RevHub
echo ========================================
echo.

echo Step 1: Open Jenkins at http://localhost:9090
echo.
echo Step 2: Click "New Item"
echo.
echo Step 3: Enter job name: RevHub-Pipeline
echo.
echo Step 4: Select "Pipeline" and click OK
echo.
echo Step 5: In Pipeline Configuration:
echo    - Definition: Pipeline script from SCM
echo    - SCM: Git
echo    - Repository URL: https://github.com/shaiksuhas2228/revhub-social-platform.git
echo    - Branch Specifier: */version1
echo    - Script Path: Jenkinsfile
echo.
echo Step 6: Click "Save"
echo.
echo Step 7: Click "Build Now" to run the pipeline
echo.
echo ========================================
echo Pipeline will automatically:
echo - Pull code from GitHub
echo - Build Docker images
echo - Deploy containers
echo - Run health checks
echo ========================================
echo.
echo After successful build:
echo - Frontend: http://localhost:4200
echo - Backend: http://localhost:8080
echo.
pause
