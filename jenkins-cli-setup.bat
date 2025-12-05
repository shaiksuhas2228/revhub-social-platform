@echo off
echo Jenkins CLI Pipeline Creation Script
echo ====================================

REM Download Jenkins CLI
echo Downloading Jenkins CLI...
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:8081/jnlpJars/jenkins-cli.jar' -OutFile 'jenkins-cli.jar'"

REM Create job config XML
echo Creating pipeline job configuration...
(
echo ^<?xml version='1.1' encoding='UTF-8'?^>
echo ^<flow-definition plugin="workflow-job@2.40"^>
echo   ^<actions/^>
echo   ^<description^>RevHub Social Platform CI/CD Pipeline^</description^>
echo   ^<keepDependencies^>false^</keepDependencies^>
echo   ^<properties/^>
echo   ^<definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.92"^>
echo     ^<scm class="hudson.plugins.git.GitSCM" plugin="git@4.8.3"^>
echo       ^<configVersion^>2^</configVersion^>
echo       ^<userRemoteConfigs^>
echo         ^<hudson.plugins.git.UserRemoteConfig^>
echo           ^<url^>https://github.com/shaiksuhas2228/revhub-social-platform.git^</url^>
echo         ^</hudson.plugins.git.UserRemoteConfig^>
echo       ^</userRemoteConfigs^>
echo       ^<branches^>
echo         ^<hudson.plugins.git.BranchSpec^>
echo           ^<name^>*/version1^</name^>
echo         ^</hudson.plugins.git.BranchSpec^>
echo       ^</branches^>
echo     ^</scm^>
echo     ^<scriptPath^>Jenkinsfile^</scriptPath^>
echo   ^</definition^>
echo   ^<triggers/^>
echo ^</flow-definition^>
) > pipeline-config.xml

echo.
echo To create the pipeline job, run:
echo java -jar jenkins-cli.jar -s http://localhost:8081 create-job RevHub-Pipeline ^< pipeline-config.xml
echo.
echo You'll need to authenticate with Jenkins credentials
echo.
pause