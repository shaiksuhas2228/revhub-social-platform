@echo off
echo Setting up Jenkins for RevHub...

REM Create Jenkins directory
mkdir jenkins 2>nul
cd jenkins

REM Download Jenkins WAR file
echo Downloading Jenkins...
powershell -Command "Invoke-WebRequest -Uri 'https://updates.jenkins-ci.org/download/war/2.426.1/jenkins.war' -OutFile 'jenkins.war'"

REM Start Jenkins
echo Starting Jenkins on port 8081...
start java -jar jenkins.war --httpPort=8081

echo.
echo Jenkins is starting...
echo Open http://localhost:8081 in your browser
echo.
echo Initial admin password will be displayed in the console above
echo or check: %USERPROFILE%\.jenkins\secrets\initialAdminPassword
echo.
pause