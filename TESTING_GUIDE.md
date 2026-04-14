# Guide de test de l'application

Ce guide explique comment tester cette application en local en s'appuyant sur Docker, les scripts de démarrage et les outils de charge disponibles.

## Prérequis

- Docker
- Docker Compose
- k6 (optionnel pour les tests de charge)
- Locust (optionnel pour les tests de charge)

## Mise en place

1. Copier le fichier d'environnement :

```bash
copy .env.example .env
```

2. Démarrer les services Docker :

```bash
docker compose -f docker/docker-compose.yml up --build -d
```

3. Appliquer les migrations :

```bash
docker compose -f docker/docker-compose.yml exec web python manage.py migrate --settings=config.settings.dev
```

4. Peupler la base de données :

```bash
docker compose -f docker/docker-compose.yml exec web python manage.py shell --settings=config.settings.dev < backend/populate_db.py
```

5. Créer un superutilisateur :

```bash
docker compose -f docker/docker-compose.yml exec web python manage.py createsuperuser --username admin --email admin@example.com --noinput --settings=config.settings.dev || true

docker compose -f docker/docker-compose.yml exec web bash -c 'echo "from django.contrib.auth import get_user_model; User = get_user_model(); user = User.objects.get(username=\"admin\"); user.set_password(\"admin123\"); user.save();" | python manage.py shell --settings=config.settings.dev'
```

### Scripts de démarrage rapide

- Sur macOS/Linux : `./quickstart.sh`
- Sur Windows : `./quickstart.ps1`

Ces scripts démarrent les services Docker, appliquent les migrations et remplissent la base de données.

## Tests unitaires

Pour exécuter les tests Django :

```bash
docker compose -f docker/docker-compose.yml exec web python manage.py test --settings=config.settings.test
```

Si vous utilisez un environnement Python local :

```bash
cd backend
python manage.py test --settings=config.settings.test
```

## Tester les Endpoints Manuellement

### Authentification

```powershell
# Login
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/accounts/login/" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"user1","password":"password123"}'

$token = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $token"
```

### Obtenir les tâches

```powershell
$headers = @{
  "Authorization" = "Token $token"
}

$tasks = Invoke-WebRequest -Uri "http://localhost:8000/api/tasks/" `
  -Headers $headers | ConvertFrom-Json

$tasks | ConvertTo-Json
```

### Créer une tâche

```powershell
$body = @{
  title = "Ma nouvelle tâche"
  description = "Description de la tâche"
  completed = $false
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/tasks/" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body $body
```

## Tests de charge

### Installation de k6

**Windows (via Chocolatey)**
```powershell
choco install k6
```

**Windows (manuel)**
1. Téléchargez depuis https://github.com/grafana/k6/releases
2. Ajoutez le chemin à `PATH`

**macOS**
```bash
brew install k6
```

**Linux**
```bash
sudo apt-get install --yes gnupg2
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6-stable.list
sudo apt-get update
sudo apt-get install k6
```

### Exécuter les tests k6

```bash
k6 run tests/k6_tests.js
```

Ou avec Docker :

```bash
docker run --rm -i grafana/k6 run - < tests/k6_tests.js
```

### Configurer l'URL de base

```powershell
# Tester contre une autre adresse
k6 run -e BASE_URL=http://api.example.com k6_tests.js
```

## Interpréter les résultats k6

Le script teste :

1. **Authentification (Login)**
   - Mesure le temps de réponse de connexion
   - Valide le retour du token

2. **Récupération des tâches (GET)**
   - Teste les temps de réponse
   - Valide la structure de réponse

3. **Création de tâches (POST)**
   - Teste la création avec authentification
   - Mesure les performances

4. **Mise à jour (PATCH)**
   - Teste la modification de tâches existantes
   - Valide les changements

5. **Suppression (DELETE)**
   - Teste la suppression sécurisée
   - Mesure les performances

### Métriques clés

- **http_req_duration** : Temps de réponse des requêtes
  - Objectif : p(95)<500ms, p(99)<1000ms
  
- **errors** : Taux d'erreur
  - Objectif : < 10%

## Plan de test recommandé

```bash
copy .env.example .env

docker compose -f docker/docker-compose.yml up --build -d
docker compose -f docker/docker-compose.yml exec web python manage.py migrate --settings=config.settings.dev
docker compose -f docker/docker-compose.yml exec web python manage.py shell --settings=config.settings.dev < backend/populate_db.py
docker compose -f docker/docker-compose.yml exec web python manage.py test --settings=config.settings.test
```

## Dépannage

### "Template Does Not Exist" ?
Cela signifie que Django ne trouve pas les templates. Assurez-vous que :
- L'app `frontend` est dans `INSTALLED_APPS`
- Les templates sont dans `backend/apps/frontend/templates/`
- L'accès au `http://localhost:8000/register/` fonctionne

### Erreur de connexion à la BD ?
- Vérifiez que PostgreSQL est en cours d'exécution
- Vérifiez les identifiants dans `settings/base.py`
- Ou utilisez SQLite pour les tests (modifiez `settings/dev.py`)

### Erreur "User matching query does not exist" dans k6 ?
- Assurez-vous que l'utilisateur `user1` existe
- Exécutez le script de peuplement de la base de données pour créer les utilisateurs

### k6 non trouvé ?
- Vérifiez que k6 est installé : `k6 version`
- Ajoutez k6 à votre `PATH` si nécessaire

## Personnaliser les tests

Vous pouvez modifier `k6_tests.js` pour ajuster :

1. **Les étapes de charge** (stage)
   ```javascript
   stages: [
     { duration: '10s', target: 10 },   // 10 utilisateurs
     { duration: '30s', target: 50 },   // 50 utilisateurs
     { duration: '30s', target: 50 },   // Stable
     { duration: '10s', target: 0 },    // Ramp down
   ]
   ```

2. **Les seuils de performance** (thresholds)
   ```javascript
   thresholds: {
     'http_req_duration': ['p(95)<500', 'p(99)<1000'],
     'errors': ['rate<0.1'],
   }
   ```

3. **Les utilisateurs de test**
   - Modifiez `USERNAME` et `PASSWORD` en haut du fichier

## Exemples d'utilisation

### Test simple (5 utilisateurs pendant 30 secondes)
```powershell
k6 run --duration 30s --vus 5 k6_tests.js
```

### Test intensif (100 utilisateurs)
```powershell
k6 run -e BASE_URL=http://localhost:8000 k6_tests.js
```

### Sauvegarder les résultats
```powershell
k6 run -o json=results.json k6_tests.js
```

---

**Bon testing ! 🚀**
