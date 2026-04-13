# ⚡ Démarrage Rapide

Ce guide vous permet de lancer l'application en moins de 5 minutes.

## 🚀 En 3 étapes

### 1. Cloner et configurer

```bash
# Cloner le repository
git clone https://github.com/your-username/scalable-task-api.git
cd scalable-task-api

# Copier le fichier de configuration
cp .env.example .env

# (Optionnel) Éditer le .env si vous avez des besoins spéciaux
# Les valeurs par défaut fonctionnent pour le développement local
```

### 2. Lancer le script de démarrage

#### Sur Windows (PowerShell)

```powershell
# Permettre l'exécution de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Exécuter le script
.\quickstart.ps1
```

#### Sur macOS/Linux (Bash)

```bash
chmod +x quickstart.sh
./quickstart.sh
```

#### Manuellement (alternative)

```bash
# Démarrer tous les services
docker-compose -f docker/docker-compose.yml up -d

# Attendre ~10 secondes pour que les services démarrent
sleep 10

# Appliquer les migrations
docker-compose -f docker/docker-compose.yml exec web \
  python manage.py migrate --settings=config.settings.dev

# Peupler la base de données
docker-compose -f docker/docker-compose.yml exec web \
  python manage.py shell --settings=config.settings.dev < backend/populate_db.py
```

### 3. Accéder à l'application

Ouvrez votre navigateur et allez à:

| Service | URL | Identifiants |
|---------|-----|--------------|
| **Web Interface** | http://localhost:8000 | - |
| **Admin Django** | http://localhost:8000/admin | admin / admin123 |
| **API Docs** | http://localhost:8000/api/ | - |
| **Locust** | http://localhost:8089 | - |

## 🔐 Identifiants par défaut

```
Administrateur:
  Username: admin
  Password: admin123

Utilisateurs de test (user1 à user10):
  Username: user{N}
  Password: password123
```

## 📊 Tester l'application

### Via curl

```bash
# Connexion
curl -X POST http://localhost:8000/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# La réponse contient le token (access)
# Utilisez-le pour les autres requêtes:
curl -X GET http://localhost:8000/api/accounts/me/ \
  -H "Authorization: Bearer <token>"
```

### Utiliser l'interface web

1. Aller à http://localhost:8000
2. Cliquer sur "Login"
3. Se connecter avec admin/admin123
4. Créer/éditer des tâches

### Tests de charge

#### Avec Locust

```bash
# Le service Locust est déjà en cours d'exécution
# Ouvrir http://localhost:8089
# Entrer les paramètres:
#   - Number of users: 50
#   - Spawn rate: 5
#   - Cliquer "Start swarming"
```

#### Avec k6 (local)

```bash
# Installation
# Ubuntu/Debian: sudo apt-get install k6
# macOS: brew install k6
# Windows: choco install k6

# Exécuter les tests
cd tests
k6 run k6_tests.js

# Avec personnalisation
k6 run k6_tests.js --vus 100 --duration 5m
```

## 📝 Commandes utiles

### Logs

```bash
# Voir tous les logs en temps réel
docker-compose -f docker/docker-compose.yml logs -f

# Voir uniquement les logs du web
docker-compose -f docker/docker-compose.yml logs -f web

# Voir les logs du container db
docker-compose -f docker/docker-compose.yml logs -f db
```

### Tests

```bash
# Exécuter les tests Django
docker-compose -f docker/docker-compose.yml exec web \
  python manage.py test --settings=config.settings.test

# Avec couverture
docker-compose -f docker/docker-compose.yml exec web \
  coverage run --source='apps' manage.py test --settings=config.settings.test

# Voir le rapport de couverture
docker-compose -f docker/docker-compose.yml exec web \
  coverage report
```

### Qualité de code

```bash
# Vérifier le formatage
docker-compose -f docker/docker-compose.yml exec web \
  black --check .

# Réparer le formatage
docker-compose -f docker/docker-compose.yml exec web \
  black .

# Organiser les imports
docker-compose -f docker/docker-compose.yml exec web \
  isort .

# Linting
docker-compose -f docker/docker-compose.yml exec web \
  flake8 .
```

### Gestion de la base de données

```bash
# Accéder à la console Django
docker-compose -f docker/docker-compose.yml exec web \
  python manage.py shell

# Accéder à PostgreSQL
docker-compose -f docker/docker-compose.yml exec db \
  psql -U taskapi_user -d taskapi_db

# Réinitialiser la base de données
docker-compose -f docker/docker-compose.yml down -v
docker-compose -f docker/docker-compose.yml up -d db redis
docker-compose -f docker/docker-compose.yml exec web \
  python manage.py migrate --settings=config.settings.dev
```

## ⚠️ Arrêter l'application

```bash
# Arrêter tous les services
docker-compose -f docker/docker-compose.yml down

# Arrêter et supprimer les volumes (réinitialiser la BD)
docker-compose -f docker/docker-compose.yml down -v
```

## 🔧 Dépannage

### Port déjà utilisé

```bash
# Voir quel processus utilise le port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Tuer le processus
kill -9 <PID>  # macOS/Linux
# ou changer le port dans docker-compose.yml
```

### Les services ne démarrent pas

```bash
# Vérifier le statut
docker-compose -f docker/docker-compose.yml ps

# Voir les erreurs
docker-compose -f docker/docker-compose.yml logs

# Redémarrer les services
docker-compose -f docker/docker-compose.yml restart
```

### Base de données ne se connecte pas

```bash
# Nettoyer les volumes et redémarrer
docker-compose -f docker/docker-compose.yml down -v
docker-compose -f docker/docker-compose.yml up -d

# Si ça persiste, vérifier le fichier .env
cat .env | grep POSTGRES
```

## 💡 Conseils

- **Premier démarrage**: Laissez 30 secondes pour que tous les services soient prêts
- **Développement**: Éditez les fichiers en local, ils sont montés en volume dans le container
- **Tests**: Exécutez toujours les tests avant de commit
- **Logs**: Consultez les logs si quelque chose ne fonctionne pas

## 📚 Documentation complète

Pour une documentation détaillée:
- [README.md](README.md) - Documentation complète
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guide de déploiement AWS
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Guide des tests

## 🆘 Besoin d'aide?

1. Consulter les [logs](#logs)
2. Regarder les [dépannage](#-dépannage)
3. Ouvrir une [GitHub Issue](https://github.com/your-username/scalable-task-api/issues)

---

**Bon développement !** 🚀
