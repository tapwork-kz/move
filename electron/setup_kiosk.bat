@echo off
chcp 65001 >nul
:: Windows Showcase Kiosk Setup Launcher
echo ====================================================
echo  Запуск автоматической настройки витрины Windows...
echo ====================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup_kiosk.ps1" %*
echo.
