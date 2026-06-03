@echo off
path=%path%;C:\Program Files\nodejs
cd /d "%~dp0"
echo ========================================
echo  CertiNanas - Iniciando...
echo ========================================
echo.
npm run dev:all
pause
