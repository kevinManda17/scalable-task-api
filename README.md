# Scalable Task API

A scalable backend API built with Django, Docker, and a cloud-ready architecture.

This project is designed to manage users and tasks while supporting concurrent users, ensuring scalability, and maintaining a fully containerized environment. All operations are executed using Docker. No local Python execution is required.

Architecture:

Client → Nginx → Django (Web) → PostgreSQL
                         ↓
                       Redis

Tech Stack:

- Backend: Django, Django REST Framework
- Database: PostgreSQL
- Cache: Redis
- Reverse Proxy: Nginx
- Containerization: Docker, Docker Compose
- Load Testing: k6, Locust
- CI/CD: GitHub Actions

Project Structure:

scalable-task-api/
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── tasks/
│   │   └── frontend/
│   ├── config/
│   ├── requirements.txt
│   └── populate_db.py
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── Dockerfile.locust
│   └── nginx/
├── tests/
│   ├── locust/
│   └── k6_tests.js
├── .env.example
└── README.md

Requirements:

- Docker
- Docker Compose

Setup and Execution (Docker Only):

1. Clone the repository:
git clone <your-repository-url>
cd scalable-task-api

2. Configure environment variables:
cp .env.example .env

3. Start the application:
docker compose -f docker/docker-compose.yml up --build

4. Apply migrations:
docker compose -f docker/docker-compose.yml exec web python manage.py migrate

5. Create superuser:
docker compose -f docker/docker-compose.yml exec web python manage.py createsuperuser

6. Populate database:
docker compose -f docker/docker-compose.yml exec web python manage.py shell < backend/populate_db.py

Access:

Application: http://localhost:8000
Admin Panel: http://localhost:8000/admin

API Endpoints:

Authentication:
POST /api/accounts/register/
POST /api/accounts/login/
GET  /api/accounts/me/

Tasks:
GET    /api/tasks/
POST   /api/tasks/
GET    /api/tasks/{id}/
PUT    /api/tasks/{id}/
DELETE /api/tasks/{id}/

Testing (Docker Only):

Run backend tests:
docker compose -f docker/docker-compose.yml exec web python manage.py test

Load testing with k6:
docker run --rm -i grafana/k6 run - < tests/k6_tests.js

Load testing with Locust:
docker build -f docker/Dockerfile.locust -t locust .
docker run -p 8089:8089 locust

Access Locust interface:
http://localhost:8089

Scaling Strategy:

The system is designed for horizontal scaling using multiple Django instances behind Nginx. The architecture supports load balancing and can be extended for high concurrency scenarios.

Deployment Strategy:

Target environment includes AWS EC2 with Docker containers and Nginx as a reverse proxy.

Steps:
1. Build Docker image
2. Push image to registry
3. Deploy on EC2
4. Configure environment variables
5. Run containers

Important Notes:

- All commands are executed inside Docker
- No local Python execution is used
- Redis is prepared for caching or asynchronous processing
- Nginx handles reverse proxy and scaling

Project Status:

- API functional
- Docker environment stable
- Load testing ready
- Scaling architecture prepared

Author:

Kevin Manda
Software Engineering Project