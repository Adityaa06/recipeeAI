@echo off
echo Creating .env file for server...

(
echo PORT=5000
echo NODE_ENV=development
echo.
echo # Database
echo MONGODB_URI=mongodb://localhost:27017/recipe-meal-planner
echo.
echo # JWT Secret
echo JWT_SECRET=recipe_ai_secret_key_2025_secure_token
echo.
echo # Google Gemini API
echo GEMINI_API_KEY=AIzaSyBwnzdzYier0BiIigIeI9b1-Tf2N_ZEthA
echo.
echo # Frontend URL
echo CLIENT_URL=http://localhost:5173
) > server\.env

echo .env file created successfully!
echo.
echo Configuration:
echo - MongoDB: mongodb://localhost:27017/recipe-meal-planner
echo - Gemini API: Configured
echo - Server Port: 5000
echo - Client Port: 5173
echo.
echo Ready to start the application!
