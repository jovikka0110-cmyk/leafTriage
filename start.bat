@echo off
title LeafTriage Launcher
echo ========================================================
echo   LeafTriage - Crop Disease Doctor for Tamil Farmers
echo ========================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "LeafTriage Python Backend" cmd /k "python backend/main.py"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
start "LeafTriage React Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting up!
echo Open your browser at: http://localhost:5173
echo.
pause
