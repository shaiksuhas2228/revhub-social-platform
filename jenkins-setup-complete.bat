@echo off
echo Complete Jenkins Setup for RevHub Pipeline
echo ==========================================

REM 1. Download and start Jenkins
echo Step 1: Setting up Jenkins...
mkdir jenkins 2>nul
cd jenkins
powershell -Command "Invoke-WebRequest -Uri 'https://updates.jenkins-ci.org/download/war/2.426.1/jenkins.war' -OutFile 'jenkins.war'"
start java -jar jenkins.war --httpPort=8081

echo.
echo Step 2: Jenkins is starting on http://localhost:8081
echo Initial password location: %USERPROFILE%\.jenkins\secrets\initialAdminPassword
echo.
echo Step 3: Install required plugins:
echo - Git plugin
echo - Pipeline plugin
echo - GitHub plugin
echo - Docker plugin
echo.
echo Step 4: Create new Pipeline job:
echo - Job name: RevHub-Pipeline
echo - Type: Pipeline
echo - Pipeline script from SCM: Git
echo - Repository URL: https://github.com/shaiksuhas2228/revhub-social-platform.git
echo - Branch: */version1
echo - Script Path: Jenkinsfile
echo.
echo Step 5: Configure GitHub webhook (optional):
echo - GitHub repo Settings > Webhooks
echo - Payload URL: http://your-jenkins-url:8081/github-webhook/
echo - Content type: application/json
echo - Events: Just the push event
echo.
pause