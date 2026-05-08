@echo off
TITLE COSEC Database Backup Tool
echo Initializing Database Backup...
echo -----------------------------------
set BACKUP_PATH=%cd%\COSEC_DEMO_Backup.bak

echo Backing up COSEC_DEMO to %BACKUP_PATH%...
sqlcmd -S localhost -C -Q "BACKUP DATABASE [COSEC_DEMO] TO DISK = '%BACKUP_PATH%' WITH FORMAT, MEDIANAME = 'COSEC_SQLServerBackups', NAME = 'Full Backup of COSEC_DEMO';"

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCCESS! 
    echo Transfer the file 'COSEC_DEMO_Backup.bak' to your new laptop.
) else (
    echo.
    echo ❌ FAILED! 
    echo Ensure SQL Server is running and you have admin permissions.
)
pause
