@echo off
echo Pushing RevHub project to GitHub...
echo.

cd /d "c:\RevHubTeam7 with jenkins\RevHubTeam7\RevProject\RevHub"

REM Initialize git if not already initialized
if not exist ".git" (
    echo Initializing git repository...
    git init
    git branch -M version1
)

REM Add remote if not exists
git remote remove origin 2>nul
git remote add origin https://github.com/shaiksuhas2228/revhub-social-platform.git

REM Add all files
echo Adding all files...
git add .

REM Commit with timestamp
echo Committing changes...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "datestamp=%YYYY%-%MM%-%DD% %HH%:%Min%:%Sec%"

git commit -m "Complete RevHub project push - %datestamp%"

REM Push to version1 branch
echo Pushing to GitHub...
git push -u origin version1 --force

echo.
echo ========================================
echo Push completed successfully!
echo Repository: https://github.com/shaiksuhas2228/revhub-social-platform.git
echo Branch: version1
echo ========================================
echo.
pause
