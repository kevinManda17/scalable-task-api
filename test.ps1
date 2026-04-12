# Script pour tester l'application sur Windows
# Usage: .\test.ps1 [migrate|seed|setup|test|clean]

param(
    [string]$Command = "help"
)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommandPath
$backendDir = Join-Path $projectRoot "backend"

Write-Host "Répertoire du projet: $projectRoot" -ForegroundColor Cyan

Set-Location $backendDir

switch ($Command) {
    "migrate" {
        Write-Host "Migration de la base de données..." -ForegroundColor Yellow
        python manage.py makemigrations
        python manage.py migrate
        Write-Host "Migrations appliquées!" -ForegroundColor Green
    }
    
    "seed" {
        Write-Host "Remplissage de la base de données..." -ForegroundColor Yellow
        python manage.py shell < populate_db.py
        Write-Host "Base de données remplie!" -ForegroundColor Green
    }
    
    "setup" {
        Write-Host "Configuration complète..." -ForegroundColor Yellow
        python manage.py makemigrations
        python manage.py migrate
        python manage.py shell < populate_db.py
        Write-Host "Configuration terminée!" -ForegroundColor Green
    }
    
    "test" {
        Write-Host "Lancement des tests k6..." -ForegroundColor Yellow
        Set-Location $projectRoot
        
        # Vérifier si k6 est installé
        $k6Path = Get-Command k6 -ErrorAction SilentlyContinue
        if ($k6Path) {
            k6 run k6_tests.js
        }
        else {
            Write-Host "k6 n'est pas installé." -ForegroundColor Red
            Write-Host "Installez k6: https://k6.io/docs/getting-started/installation" -ForegroundColor Yellow
        }
    }
    
    "clean" {
        Write-Host "Nettoyage..." -ForegroundColor Yellow
        $dbPath = Join-Path $backendDir "db.sqlite3"
        if (Test-Path $dbPath) {
            Remove-Item $dbPath
            Write-Host "Base de données supprimée!" -ForegroundColor Green
        }
    }
    
    default {
        Write-Host "Usage: .\test.ps1 [commande]" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Commandes disponibles:" -ForegroundColor Green
        Write-Host "  migrate   - Appliquer les migrations"
        Write-Host "  seed      - Remplir la base de données avec des données de test"
        Write-Host "  setup     - Faire les migrations ET remplir la BD (complet)"
        Write-Host "  test      - Lancer les tests k6"
        Write-Host "  clean     - Supprimer la base de données locale"
        Write-Host "  help      - Afficher cette aide"
    }
}
