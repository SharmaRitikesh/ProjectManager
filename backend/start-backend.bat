@echo off
REM ============================================================
REM Start Backend - Project Manager
REM Uses 'subst' to create a virtual drive to avoid path issues
REM with the + character in the directory name
REM ============================================================

REM Find an available drive letter (Z:, Y:, X:...)
set "DRIVE_LETTER="
for %%d in (Z Y X W V) do (
    if not exist %%d:\ (
        set "DRIVE_LETTER=%%d"
        goto :found_drive
    )
)
echo ERROR: Could not find an available drive letter.
pause
exit /b 1

:found_drive
echo Using drive %DRIVE_LETTER%: for backend...

REM Map the backend directory to a virtual drive
subst %DRIVE_LETTER%: "%~dp0"
if errorlevel 1 (
    echo ERROR: Failed to create virtual drive. Try running as Administrator.
    pause
    exit /b 1
)

REM Change to the virtual drive
cd /d %DRIVE_LETTER%:\

REM Find Maven
set "MVN_CMD="
for /r "%USERPROFILE%\.m2\wrapper" %%f in (mvn.cmd) do (
    if exist "%%f" set "MVN_CMD=%%f"
)

if "%MVN_CMD%"=="" (
    echo Maven not found in .m2 wrapper. Using Maven wrapper to download...
    call mvnw.cmd spring-boot:run
) else (
    echo Found Maven at: %MVN_CMD%
    call "%MVN_CMD%" spring-boot:run
)

REM Cleanup: remove the virtual drive mapping
subst %DRIVE_LETTER%: /d
echo.
echo Backend stopped.
pause
