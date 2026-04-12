#!/bin/bash

# Script pour tester l'application
# Usage: bash test.sh [migrate|seed|test|clean]

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "Répertoire du projet: $PROJECT_ROOT"
cd "$BACKEND_DIR"

case "${1:-help}" in
  migrate)
    echo "Migration de la base de données..."
    python manage.py makemigrations
    python manage.py migrate
    echo "Migrations appliquées!"
    ;;
    
  seed)
    echo "Remplissage de la base de données..."
    python manage.py shell < populate_db.py
    echo "Base de données remplie!"
    ;;
    
  setup)
    echo "Configuration complète..."
    python manage.py makemigrations
    python manage.py migrate
    python manage.py shell < populate_db.py
    echo "Configuration terminée!"
    ;;
    
  test)
    echo "Lancement des tests k6..."
    cd "$PROJECT_ROOT"
    if command -v k6 &> /dev/null; then
      k6 run k6_tests.js
    else
      echo "k6 n'est pas installé. Installez k6: https://k6.io/docs/getting-started/installation"
    fi
    ;;
    
  clean)
    echo "Nettoyage..."
    if [ -f "$BACKEND_DIR/db.sqlite3" ]; then
      rm "$BACKEND_DIR/db.sqlite3"
      echo "Base de données supprimée!"
    fi
    ;;
    
  help|*)
    echo "Usage: bash test.sh [commande]"
    echo ""
    echo "Commandes disponibles:"
    echo "  migrate   - Appliquer les migrations"
    echo "  seed      - Remplir la base de données avec des données de test"
    echo "  setup     - Faire les migrations ET remplir la BD (complet)"
    echo "  test      - Lancer les tests k6"
    echo "  clean     - Supprimer la base de données locale"
    echo "  help      - Afficher cette aide"
    ;;
esac
