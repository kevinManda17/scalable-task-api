# Scalable Task API

A complete Django application for task management with user authentication, REST API, and modern web interface.

## Features

- ✅ User Authentication (registration/login)
- ✅ Task Management (full CRUD)
- ✅ REST API with search and filtering
- ✅ Responsive web interface
- ✅ Dockerized for easy deployment
- ✅ PostgreSQL database

## Architecture

```
scalable-task-api/
├── backend/                 # Django Application
│   ├── apps/
│   │   ├── accounts/        # User Management
│   │   └── tasks/           # Task Management
│   ├── config/              # Django Configuration
│   └── requirements.txt
├── frontend/                # HTML Templates
│   ├── static/
│   └── templates/
├── docker/                  # Docker Configuration
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── nginx/
└── .env                     # Environment Variables
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. **Clone the project**
   ```bash
   git clone <repository-url>
   cd scalable-task-api
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Launch the application**
   ```bash
   docker compose -f docker/docker-compose.yml up --build
   ```

4. **Apply migrations**
   ```bash
   docker compose -f docker/docker-compose.yml exec web python manage.py migrate
   ```

5. **Access the application**
   - Web interface: http://localhost:8000
   - Django Admin: http://localhost:8000/admin/

## Usage

### Web Interface

- **Home Page** (`/`) : Dashboard with statistics
- **Login** (`/login/`) : Sign in
- **Register** (`/register/`) : Create account
- **Tasks** (`/tasks/`) : Manage your tasks

### REST API

#### Authentication
```
POST /api/accounts/register/    # Registration
POST /api/accounts/login/       # Login
POST /api/accounts/logout/      # Logout
GET  /api/accounts/me/          # User info
```

#### Tasks
```
GET    /api/tasks/              # List tasks (with search/filtering)
POST   /api/tasks/              # Create task
GET    /api/tasks/{id}/         # Task details
PUT    /api/tasks/{id}/         # Update task
PATCH  /api/tasks/{id}/         # Partial update
DELETE /api/tasks/{id}/         # Delete task
```

#### Search Parameters
- `search=title` : Search in title and description
- `completed=true/false` : Filter by status
- `ordering=-created_at` : Sort by date (default)

## Development

### App Structure

#### accounts
- Custom `User` model
- Session-based authentication
- Serializers for registration/login

#### tasks
- `Task` model with user relationship
- REST API with search and filtering
- User permissions

### Useful Commands

```bash
# Create superuser
docker compose -f docker/docker-compose.yml exec web python manage.py createsuperuser

# Apply migrations
docker compose -f docker/docker-compose.yml exec web python manage.py migrate

# Collect static files
docker compose -f docker/docker-compose.yml exec web python manage.py collectstatic

# Run tests
docker compose -f docker/docker-compose.yml exec web python manage.py test
```

## Deployment

### Production

1. Modify `backend/config/settings/prod.py`
2. Configure environment variables
3. Use `docker-compose.prod.yml` (to be created)

### Environment Variables

```env
DJANGO_ENV=prod
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=www.yourdomain.com

POSTGRES_DB=your-db
POSTGRES_USER=your-user
POSTGRES_PASSWORD=your-password
```

## Technologies Used

- **Backend** : Django 5.0, Django REST Framework
- **Database** : PostgreSQL
- **Frontend** : HTML5, CSS3, Vanilla JavaScript
- **Deployment** : Docker, Docker Compose
- **Cache** : Redis (configured but not used)
- **Web Server** : Nginx (configured)

## Security

- Django session authentication
- CSRF protection
- User permissions
- Environment variables for secrets

## Performance Goals

- < 300ms response time
- Up to 50,000 concurrent users
- High availability (99.9%)

## Load Testing

The system is designed to be tested using:

- k6
- Locust

Simulating thousands of virtual users to validate performance and scalability.

## Deployment

Deployed on AWS using:

- EC2 instances
- Application Load Balancer
- Auto Scaling Groups

## Project Structure

- backend/ --> Django API
- frontend/ --> Templates (Django-based UI)
- docker/ --> Docker & Nginx configs
- scripts/ --> automation scripts

## Purpose

This project is designed as a learning and professional engineering project to master:

- Backend architecture
- Cloud deployment
- System scalability
- Performance optimization

## Contribution

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push and create a PR

## License

MIT License - see LICENSE file for details.