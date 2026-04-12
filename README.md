# Scalable Task API

[![CI/CD Pipeline](https://github.com/your-username/scalable-task-api/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-username/scalable-task-api/actions/workflows/ci-cd.yml)
[![codecov](https://codecov.io/gh/your-username/scalable-task-api/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/scalable-task-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A complete Django application for task management with user authentication, REST API, modern web interface, and cloud deployment capabilities.

## 🚀 Features

- ✅ **User Authentication** (registration/login/logout)
- ✅ **Task Management** (full CRUD operations)
- ✅ **REST API** with search and filtering
- ✅ **Responsive Web Interface** with modern UI
- ✅ **Docker Containerization** for easy deployment
- ✅ **PostgreSQL Database** with Redis caching
- ✅ **Load Testing** with k6 and Locust
- ✅ **Code Quality** (Black, Flake8, isort)
- ✅ **CI/CD Pipeline** with GitHub Actions
- ✅ **AWS Deployment** ready
- ✅ **Comprehensive Testing** suite

## 🏗️ Architecture

```
scalable-task-api/
├── backend/                    # Django Application
│   ├── apps/
│   │   ├── accounts/          # User Management
│   │   ├── tasks/             # Task Management
│   │   └── frontend/          # Web Interface
│   ├── config/                # Django Configuration
│   ├── requirements.txt       # Python Dependencies
│   └── populate_db.py         # Database Seeding
├── docker/                     # Docker Configuration
│   ├── docker-compose.yml     # Local Development
│   ├── Dockerfile             # Web App Container
│   ├── Dockerfile.locust      # Load Testing Container
│   └── nginx/                 # Nginx Configuration
├── tests/                      # Testing Suite
│   ├── locust/                # Locust Load Tests
│   └── k6_tests.js            # k6 Performance Tests
├── .github/workflows/         # CI/CD Pipelines
├── .env.example               # Environment Variables Template
└── README.md                  # This file
```

## 🛠️ Tech Stack

- **Backend**: Django 5.0, Django REST Framework
- **Database**: PostgreSQL
- **Cache**: Redis
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Testing**: pytest, k6, Locust
- **Code Quality**: Black, Flake8, isort
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud**: AWS (ECS, ECR, RDS, ElastiCache)

## 📋 Prerequisites

- Docker and Docker Compose
- Git
- Python 3.11+ (for local development)
- AWS CLI (for deployment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/scalable-task-api.git
cd scalable-task-api
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

Required environment variables:
```env
POSTGRES_DB=taskapi
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=db
POSTGRES_PORT=5432

REDIS_URL=redis://redis:6379

SECRET_KEY=your-django-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
```

### 3. Launch with Docker

```bash
# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec web python manage.py migrate

# Populate database with test data
docker-compose exec web python manage.py shell < populate_db.py
```

### 4. Access the Application

- **Web Interface**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **Load Testing (Locust)**: http://localhost:8089

## 🧪 Testing

### Unit Tests

```bash
# Run Django tests
docker-compose exec web python manage.py test

# With coverage
docker-compose exec web coverage run manage.py test
docker-compose exec web coverage report
```

### Load Testing with k6

```bash
# Run k6 tests
k6 run k6_tests.js

# With custom URL
k6 run -e BASE_URL=http://localhost:8000 k6_tests.js
```

### Load Testing with Locust

Locust is included in the Docker setup and accessible at http://localhost:8089

```bash
# Or run locally
pip install locust
locust -f tests/locust/locustfile.py --host http://localhost:8000
```

## 💻 Local Development

### Setup Development Environment

```bash
# Create virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Populate database
python manage.py shell < populate_db.py

# Start development server
python manage.py runserver
```

### Code Quality

```bash
# Format code
black .

# Sort imports
isort .

# Lint code
flake8 .

# Run all quality checks
black --check . && isort --check-only . && flake8 .
```

## 🔧 API Endpoints

### Authentication
- `POST /api/accounts/register/` - User registration
- `POST /api/accounts/login/` - User login
- `POST /api/accounts/logout/` - User logout
- `GET /api/accounts/me/` - Current user info

### Tasks
- `GET /api/tasks/` - List user's tasks
- `POST /api/tasks/` - Create new task
- `GET /api/tasks/{id}/` - Get specific task
- `PUT /api/tasks/{id}/` - Update task
- `PATCH /api/tasks/{id}/` - Partial update task
- `DELETE /api/tasks/{id}/` - Delete task

### Web Interface
- `GET /` - Home page
- `GET /login/` - Login page
- `GET /register/` - Registration page
- `GET /tasks/` - Task management interface
- `GET /dashboard/` - User dashboard

## 🚢 Deployment

### AWS Deployment

1. **Prerequisites**:
   - AWS Account with appropriate permissions
   - ECR Repository created
   - ECS Cluster and Service configured
   - RDS PostgreSQL instance
   - ElastiCache Redis cluster

2. **Configure AWS Secrets** in GitHub:
   ```
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   AWS_REGION
   ECS_CLUSTER_NAME
   ECS_SERVICE_NAME
   ECS_TASK_DEFINITION
   SUBNET_IDS
   SECURITY_GROUP_ID
   ```

3. **Deploy**:
   ```bash
   # Push to main branch triggers automatic deployment
   git push origin main
   ```

### Manual Deployment

```bash
# Build and push Docker image
docker build -t your-registry/task-api .
docker push your-registry/task-api

# Deploy to your server/container platform
```

## 📊 Monitoring & Performance

### Load Testing Results

The application is designed to handle:
- **100 concurrent users** with response times < 500ms
- **1000+ tasks** in the database
- **High availability** with proper caching

### Key Metrics

- **Response Time**: < 500ms for 95% of requests
- **Error Rate**: < 1%
- **Throughput**: 100+ requests/second
- **Database Queries**: Optimized with select_related/prefetch_related

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 style guide
- Write tests for new features
- Update documentation
- Ensure code quality checks pass
- Use meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Django REST Framework for the amazing API framework
- Docker for containerization
- k6 and Locust for load testing
- GitHub Actions for CI/CD
- AWS for cloud infrastructure

## 📞 Support

If you have any questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Happy coding! 🎉**
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