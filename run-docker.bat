@echo off
echo Building and starting InstaFood application...
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo.
echo Application is starting...
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000
echo MongoDB: localhost:27017
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down