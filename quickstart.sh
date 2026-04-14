#!/bin/bash
# Quick Start Script for Scalable Task API - Linux/macOS

set -e

echo "Scalable Task API - Quick Start"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker and Docker Compose are installed
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo -e "${GREEN}Docker and Docker Compose are installed${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env file with your values.${NC}"
fi

# Start Docker Compose
echo -e "${YELLOW}Starting Docker Compose services...${NC}"
docker-compose -f docker/docker-compose.yml up -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose -f docker/docker-compose.yml exec -T web \
    python manage.py migrate --settings=config.settings.dev

# Populate database
echo -e "${YELLOW}Populating database with test data...${NC}"
docker-compose -f docker/docker-compose.yml exec -T web \
    python manage.py shell --settings=config.settings.dev < backend/populate_db.py

# Create superuser
echo -e "${YELLOW}Creating superuser (admin/admin123)...${NC}"
docker-compose -f docker/docker-compose.yml exec -T web \
    python manage.py createsuperuser \
    --username admin \
    --email admin@example.com \
    --noinput \
    --settings=config.settings.dev || true

# Set password for superuser
docker-compose -f docker/docker-compose.yml exec -T web \
    bash -c 'echo "from django.contrib.auth import get_user_model; User = get_user_model(); user = User.objects.get(username=\"admin\"); user.set_password(\"admin123\"); user.save(); print(\"Superuser password set!\")" | python manage.py shell --settings=config.settings.dev' || true

echo ""
echo -e "${GREEN}Application started successfully!${NC}"
echo ""
echo "Access points:"
echo "  - Web Interface: http://localhost:8000"
echo "  - API: http://localhost:8000/api/"
echo "  - Admin Panel: http://localhost:8000/admin/"
echo "  - Locust: http://localhost:8089"
echo ""
echo "Default credentials:"
echo "  - Username: admin"
echo "  - Password: admin123"
echo ""
echo "Test users: user1 to user10 (password: password123)"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose -f docker/docker-compose.yml logs -f"
echo "  - Stop services: docker-compose -f docker/docker-compose.yml down"
echo "  - Run tests: docker-compose -f docker/docker-compose.yml exec web python manage.py test"
echo ""
