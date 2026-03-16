@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM Fixed to handle paths with spaces and special characters like +
@REM ----------------------------------------------------------------------------

@echo off
setlocal enabledelayedexpansion

set "WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain"

@REM Find project base dir using short (8.3) path to avoid special char issues
for %%I in ("%~dp0.") do set "MAVEN_PROJECTBASEDIR=%%~sI\"

@REM Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set "JAVA_EXE=java.exe"
"%JAVA_EXE%" -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto execute

echo Error: JAVA_HOME is not set and no 'java' command could be found in your PATH.
goto end

:findJavaFromJavaHome
set "JAVA_HOME=%JAVA_HOME:"=%"
set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
if exist "%JAVA_EXE%" goto execute
echo Error: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
goto end

:execute
set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"

if exist "%WRAPPER_JAR%" (
    "%JAVA_EXE%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" -cp "%WRAPPER_JAR%" %WRAPPER_LAUNCHER% %*
) else (
    echo Maven wrapper jar not found. Downloading...
    powershell -Command "Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar' -OutFile '%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar'"
    "%JAVA_EXE%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" -cp "%WRAPPER_JAR%" %WRAPPER_LAUNCHER% %*
)

:end
endlocal
