# Scalable Task API

A scalable backend API built with Django, Docker, and a cloud-ready architecture.

Ce projet gère les utilisateurs et les tâches tout en offrant une architecture conteneurisée prête pour une production cloud.

---

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation et démarrage](#installation-et-démarrage)
- [Configuration](#configuration)
- [Points d'accès API](#points-daccès-api)
- [Tests et charge](#tests-et-charge)
- [Déploiement](#déploiement)
- [État du projet](#état-du-projet)
- [Auteur](#auteur)

---

## Vue d'ensemble

Scalable Task API est une API REST conçue pour gérer des tâches et des comptes utilisateur dans un environnement Dockerisé. Le backend Django est prêt à évoluer horizontalement grâce à Nginx et Redis.

## Architecture

Diagramme de flux principal:

Client → Nginx → Django (Web) → PostgreSQL
                         ↓
                       Redis

### Composants clés

- Nginx : reverse proxy et routage
- Django : backend web et API REST
- PostgreSQL : base de données relationnelle
- Redis : cache et support futur d'asynchronisme
- Docker : conteneurisation de l’application
- Docker Compose : orchestration locale

## Fonctionnalités

- Authentification et gestion des comptes
- CRUD complet pour les tâches
- Interface de monitoring et administration via Django Admin
- Architecture pensée pour la montée en charge
- Environnements Docker pour développement et tests

## Stack technique

- Backend : Django, Django REST Framework
- Base de données : PostgreSQL
- Cache : Redis
- Reverse proxy : Nginx
- Conteneurisation : Docker, Docker Compose
- Tests de charge : k6, Locust
- CI/CD : GitHub Actions

## Structure du projet

```
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
```

## Prérequis

- Docker
- Docker Compose

## Installation et démarrage

1. Cloner le dépôt :

```bash
git clone https://github.com/kevinManda17/scalable-task-api.git
cd scalable-task-api
```

2. Copier le fichier d’exemple d’environnement :

```bash
copy .env.example .env
```

3. Démarrer les services Docker :

```bash
docker compose -f docker/docker-compose.yml up --build
```

4. Appliquer les migrations :

```bash
docker compose -f docker/docker-compose.yml exec web python manage.py migrate
```

5. Créer un superutilisateur :

```bash
docker compose -f docker/docker-compose.yml exec web python manage.py createsuperuser
```

6. Peupler la base de données :

```bash
docker compose -f docker/docker-compose.yml exec web python manage.py shell < backend/populate_db.py
```

## Configuration

- `.env.example` contient les variables d’environnement nécessaires.
- Configurez les paramètres PostgreSQL, Redis et Django avant le démarrage.

## Points d'accès API

### Authentification

- `POST /api/accounts/register/`
- `POST /api/accounts/login/`
- `GET  /api/accounts/me/`

### Tâches

- `GET    /api/tasks/`
- `POST   /api/tasks/`
- `GET    /api/tasks/{id}/`
- `PUT    /api/tasks/{id}/`
- `DELETE /api/tasks/{id}/`

## Tests et charge

### Tests unitaires

```bash
docker compose -f docker/docker-compose.yml exec web python manage.py test
```

### Tests de charge k6

```bash
docker run --rm -i grafana/k6 run - < tests/k6_tests.js
```

### Tests de charge Locust

```bash
docker build -f docker/Dockerfile.locust -t locust .
docker run -p 8089:8089 locust
```

Accéder à l’interface Locust : `http://localhost:8089`

## Déploiement

La cible de déploiement idéale est un environnement cloud comme AWS EC2, où les conteneurs Docker sont exécutés derrière Nginx.

Étapes générales :

1. Construire l’image Docker
2. Envoyer l’image vers un registre
3. Déployer sur une instance cloud
4. Configurer les variables d’environnement
5. Lancer les conteneurs

## État du projet

- API fonctionnelle
- Environnement Docker stable
- Scénarios de tests de charge prêts
- Architecture prête pour l’extensibilité

## Auteur

Kevin Manda
Software Engineering Project