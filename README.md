# Système de tickets IT

[English](./README.md) | [Français](./README.fr.md) | [Nederlands](./README.nl.md) | [中文](./README.zh-CN.md)

Plateforme interne de support IT basée sur **Django + DRF + Celery + PostgreSQL + Redis + React + MUI**.

## Fonctionnalités

- Cycle de vie des tickets : création, attribution, résolution, clôture.
- Gestion des employés (CRUD).
- Base de connaissances avec génération d'embeddings asynchrone.
- Analyse assistée par IA pour les nouveaux tickets.
- Interface multilingue (`zh`, `en`, `fr`, `nl`).
- Supervision : Prometheus + Grafana + exporters.

## Démarrage rapide (Docker Compose)

```bash
docker compose up --build -d
```

URLs :

- Frontend : <http://localhost>
- API backend : <http://localhost:8000/api/>
- Admin Django : <http://localhost:8000/admin/>
- Prometheus : <http://localhost:9090>
- Grafana : <http://localhost:3001> (`admin/admin123`)

## Développement local

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Worker Celery :

```bash
cd backend
celery -A config worker --loglevel=info --pool=solo
```

Frontend :

```bash
cd frontend
npm install
npm run dev
```

## Synchroniser avec GitHub

```bash
git remote add origin git@github.com:yaowubarbara/it-ticketing-system.git
git push -u origin work
```
