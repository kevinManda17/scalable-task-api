FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copier requirements
COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le backend
COPY backend /app

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
# Commande production
# CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]