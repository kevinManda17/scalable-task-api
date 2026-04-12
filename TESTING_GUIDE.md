# Guide de Test de l'Application

Ce guide vous montre comment tester l'application avec des données de test et des tests de charge avec k6.

## 📋 Prérequis

- Django
- Python 3.8+
- k6 (pour les tests de charge) - [Installer k6](https://k6.io/docs/getting-started/installation)
- PostgreSQL (ou votre BD configurée)

## 🚀 Mise en Place

### 1. Appliquer les migrations

```powershell
# Windows
.\test.ps1 migrate

# Ou directement
cd backend
python manage.py makemigrations
python manage.py migrate
```

### 2. Remplir la base de données avec des données de test

```powershell
# Windows
.\test.ps1 seed

# Ou directement
cd backend
python manage.py shell < populate_db.py
```

Cela créera :
- **1 super utilisateur** : `admin` / `admin123`
- **10 utilisateurs de test** : `user1` à `user10` / `password123`
- **30-80 tâches** réparties entre les utilisateurs

### 3. Configuration complète (migrations + seed)

```powershell
# Windows
.\test.ps1 setup
```

## 🧪 Tester les Endpoints Manuellement

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

## 📊 Tests de Charge avec k6

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

```powershell
# Windows
.\test.ps1 test

# Ou directement
k6 run k6_tests.js
```

### Configurer l'URL de base

```powershell
# Tester contre une autre adresse
k6 run -e BASE_URL=http://api.example.com k6_tests.js
```

## 📈 Interpréter les Résultats k6

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

## 🎯 Plan de Test Recommandé

```powershell
# 1. Nettoyer
.\test.ps1 clean

# 2. Migrer
.\test.ps1 migrate

# 3. Remplir les données
.\test.ps1 seed

# 4. Démarrer le serveur Django
cd backend
python manage.py runserver

# 5. Dans un autre terminal, lancer les tests k6
.\test.ps1 test
```

## 🐛 Dépannage

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
- Exécutez `.\test.ps1 seed` pour créer les utilisateurs

### k6 non trouvé ?
- Vérifiez que k6 est installé : `k6 version`
- Ajoutez k6 à votre `PATH` si nécessaire

## 💡 Personnaliser les Tests

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

## 📝 Exemples d'Utilisation

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
