# Quick Start Script for Scalable Task API - Windows PowerShell

Write-Host "🚀 Scalable Task API - Quick Start for Windows" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Check if Docker is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✓ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop for Windows." -ForegroundColor Red
    exit 1
}

try {
    docker-compose --version | Out-Null
    Write-Host "✓ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Desktop for Windows." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please edit .env file with your values!" -ForegroundColor Yellow
}

# Start Docker Compose
Write-Host "Starting Docker Compose services..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.yml up -d

# Wait for services to be healthy
Write-Host "Waiting for services to be ready (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.yml exec -T web `
    python manage.py migrate --settings=config.settings.dev

# Populate database
Write-Host "Populating database with test data..." -ForegroundColor Yellow
$populateScript = Get-Content "backend/populate_db.py" -Raw
docker-compose -f docker/docker-compose.yml exec -T web `
    python manage.py shell --settings=config.settings.dev -c "$populateScript"

# Create superuser
Write-Host "Creating superuser (admin/admin123)..." -ForegroundColor Yellow
$createUserCmd = @"
from django.contrib.auth import get_user_model
from django.db import IntegrityError
User = get_user_model()
try:
    user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('✓ Superuser created successfully')
except IntegrityError:
    user = User.objects.get(username='admin')
    user.set_password('admin123')
    user.save()
    print('✓ Superuser password updated')
"@

docker-compose -f docker/docker-compose.yml exec -T web `
    python manage.py shell --settings=config.settings.dev -c $createUserCmd || $true

Write-Host ""
Write-Host "✅ Application started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Access points:" -ForegroundColor Cyan
Write-Host "  - Web Interface: http://localhost:8000" -ForegroundColor White
Write-Host "  - API: http://localhost:8000/api/" -ForegroundColor White
Write-Host "  - Admin Panel: http://localhost:8000/admin/" -ForegroundColor White
Write-Host "  - Locust: http://localhost:8089" -ForegroundColor White
Write-Host ""
Write-Host "Default credentials:" -ForegroundColor Cyan
Write-Host "  - Username: admin" -ForegroundColor White
Write-Host "  - Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Test users: user1 to user10 (password: password123)" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  - View logs: docker-compose -f docker/docker-compose.yml logs -f" -ForegroundColor White
Write-Host "  - Stop services: docker-compose -f docker/docker-compose.yml down" -ForegroundColor White
Write-Host "  - Run tests: docker-compose -f docker/docker-compose.yml exec web python manage.py test" -ForegroundColor White
Write-Host ""

# Open the application in browser
$openBrowser = Read-Host "Do you want to open the application in your browser? (y/n)"
if ($openBrowser -eq "y") {
    Start-Process http://localhost:8000
}
