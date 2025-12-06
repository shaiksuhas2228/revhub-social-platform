@echo off
echo ========================================
echo Jenkins CLI - Create Pipeline Job
echo ========================================
echo.

cd /d "c:\RevHubTeam7 with jenkins\RevHubTeam7\RevProject\RevHub"

echo Downloading Jenkins CLI...
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:9090/jnlpJars/jenkins-cli.jar' -OutFile 'jenkins-cli.jar'"

echo.
echo Creating Jenkins job from XML...
java -jar jenkins-cli.jar -s http://localhost:9090 -auth admin:admin create-job RevHub-Pipeline < jenkins-auto-setup.xml

echo.
echo ========================================
echo Job created successfully!
echo.
echo To trigger the build:
echo   java -jar jenkins-cli.jar -s http://localhost:9090 -auth admin:admin build RevHub-Pipeline
echo.
echo Or visit: http://localhost:9090/job/RevHub-Pipeline/
echo ========================================
pause
