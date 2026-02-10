# IT Ticketing System

[English](./README.md) | [Français](./README.fr.md) | [Nederlands](./README.nl.md) | [中文](./README.zh-CN.md)

An internal IT support ticketing platform built with **Django + DRF + Celery + PostgreSQL + Redis + React + MUI**.

## Features

- Ticket lifecycle: create, assign, resolve, close.
- Employee management (CRUD).
- Knowledge base management with async embedding generation.
- AI-assisted analysis for newly created tickets.
- i18n-ready frontend (`zh`, `en`, `fr`, `nl`).
- Monitoring stack: Prometheus + Grafana + exporters.

## Tech Stack

- **Backend**: Django 6, DRF, Celery, PostgreSQL, Redis
- **Frontend**: React 19, Vite, MUI, React Router, i18next
- **Observability**: django-prometheus, Prometheus, Grafana
- **DevOps**: Docker Compose, GitHub Actions

## Project Structure

```text
it-ticketing-system/
├── backend/
├── frontend/
├── monitoring/
├── docker-compose.yml
└── .github/workflows/test.yml
```

## Quick Start (Docker Compose)

```bash
docker compose up --build -d
```

### Service URLs

- Frontend: <http://localhost>
- Backend API: <http://localhost:8000/api/>
- Django Admin: <http://localhost:8000/admin/>
- Prometheus: <http://localhost:9090>
- Grafana: <http://localhost:3001> (`admin/admin123`)

Stop services:

```bash
docker compose down
```

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Run Celery worker:

```bash
cd backend
celery -A config worker --loglevel=info --pool=solo
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Overview

Base prefix: `/api/`

- Employees: `/employees/`, `/employees/{employee_id}/`
- Tickets: `/tickets/`, `/tickets/{id}/`
- Ticket actions: `/tickets/{id}/assign/`, `/resolve/`, `/close/`
- Knowledge base: `/knowledge-base/`, `/knowledge-base/{id}/`

## CI

GitHub Actions workflow: `.github/workflows/test.yml`

## How to sync this repo to your GitHub

### Option A (recommended): push current branch

```bash
git remote add origin git@github.com:yaowubarbara/it-ticketing-system.git
# or: git remote add origin https://github.com/yaowubarbara/it-ticketing-system.git

git push -u origin work
```

### Option B: push to main

```bash
git checkout main
git merge work
git push origin main
```

### Option C: create PR on GitHub

1. Push branch `work`.
2. Open GitHub repo page.
3. Click **Compare & pull request**.
4. Merge after review.

---

If you want, I can also split docs by audience (developer vs operator) and add screenshots.
