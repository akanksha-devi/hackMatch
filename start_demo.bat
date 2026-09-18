@echo off
echo ===================================================
echo   HackMatch - Multi-College Hackathon Platform
echo ===================================================
echo.
echo 1. Starting Express + MongoDB Backend on http://localhost:5000 ...
cd backend
start "HackMatch Backend API" cmd /k "node server.js"
cd ..

echo 2. Starting React + Vite Frontend on http://localhost:5173 ...
cd frontend
start "HackMatch Frontend Client" cmd /k "npm run dev"
cd ..

echo.
echo ===================================================
echo   Both servers launched successfully!
echo   Student Portal: http://localhost:5173
echo   Admin Console:  http://localhost:5173/admin/login
echo ===================================================
pause
