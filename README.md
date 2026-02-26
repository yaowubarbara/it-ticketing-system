# IT Ticketing System

Internal IT support ticketing platform with AI-assisted ticket analysis, 4-language interface, and full observability stack.

![Django](https://img.shields.io/badge/Django-5-092E20?logo=django)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Celery](https://img.shields.io/badge/Celery-5-37814A?logo=celery)

## Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────┐
│   React (Vite)  │◄──────►│  Django REST API  │◄──────►│ PostgreSQL  │
│   Frontend      │  REST  │  + Celery Workers │        │  Database   │
└─────────────────┘        └────────┬─────────┘        └─────────────┘
                                    │
                           ┌────────┴─────────┐
                           │                  │
                     ┌─────▼─────┐    ┌───────▼──────┐
                     │   Redis   │    │  Prometheus   │
                     │  (Queue)  │    │  + Grafana    │
                     └───────────┘    └──────────────┘
```

## Features

- **Ticket lifecycle** — Create, assign, resolve, close with full audit trail
- **AI-assisted analysis** — Auto-categorization, confidence scoring, and suggested solutions via RAG
- **Knowledge base** — Semantic search with vector embeddings for faster ticket resolution
- **Multilingual (4 languages)** — Chinese, English, French, Dutch with browser auto-detection
- **Async processing** — Celery workers for AI analysis without blocking HTTP requests
- **Monitoring** — Prometheus + Grafana dashboards for ticket volume, resolution time, SLA tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, i18next |
| Backend | Django, Django REST Framework |
| Task Queue | Celery + Redis |
| Database | PostgreSQL (TimescaleDB) |
| AI | OpenAI API, vector embeddings for RAG-based similarity search |
| Monitoring | Prometheus, Grafana, django-prometheus |
| Infrastructure | Docker Compose, Nginx |
| CI | GitHub Actions |

## Quick Start

```bash
# Start all services
docker compose up --build -d

# Run migrations
docker compose exec backend python manage.py migrate

# Create admin user
docker compose exec backend python manage.py createsuperuser
```

### Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/tickets/` | List / create tickets |
| GET/PATCH/DELETE | `/api/tickets/<id>/` | Ticket detail |
| POST | `/api/tickets/<id>/assign/` | Assign to IT staff |
| POST | `/api/tickets/<id>/resolve/` | Mark as resolved |
| POST | `/api/tickets/<id>/close/` | Close ticket |
| GET/POST | `/api/employees/` | List / create employees |
| GET/POST | `/api/knowledge-base/` | List / create knowledge articles |

## Project Structure

```
├── backend/
│   ├── config/            # Django settings, URL routing
│   ├── ticketing/         # Models, views, serializers, Celery tasks
│   └── requirements.txt
├── frontend/
│   ├── src/components/    # React components (Dashboard, TicketList, etc.)
│   ├── src/i18n/          # i18next config
│   └── public/locales/    # Translation files (zh/en/fr/nl)
├── monitoring/            # Prometheus & Grafana configuration
├── docker-compose.yml
└── .github/workflows/     # CI pipeline
```

## Local Development

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Celery worker (separate terminal)
celery -A config worker --loglevel=info --pool=solo

# Frontend
cd frontend
npm install && npm run dev
```

## License

MIT
