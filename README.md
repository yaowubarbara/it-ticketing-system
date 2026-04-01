<h1 align="center">IT Ticketing System</h1>

<p align="center">
  Production-grade internal IT support platform with AI-powered ticket analysis, async task processing, 4-language internationalization, and full observability stack.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Django-5-092E20?logo=django" alt="Django"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker" alt="Docker"/>
  <img src="https://img.shields.io/badge/Celery-5-37814A?logo=celery" alt="Celery"/>
  <img src="https://img.shields.io/badge/Prometheus-E6522C?logo=prometheus&logoColor=white" alt="Prometheus"/>
  <img src="https://img.shields.io/badge/Grafana-F46800?logo=grafana&logoColor=white" alt="Grafana"/>
</p>

## Demo

https://github.com/yaowubarbara/it-ticketing-system/raw/main/demo.mp4

## Key Features

- **AI-Assisted Ticket Analysis** — Auto-categorization with confidence scoring and RAG-powered suggested solutions
- **Knowledge Base with Semantic Search** — Vector embeddings enable similarity matching against past tickets and documentation
- **4-Language Interface** — Full i18n support for Chinese, English, French, and Dutch with browser auto-detection
- **Async Processing** — Celery workers handle AI inference without blocking HTTP requests
- **Full Observability** — Prometheus metrics + Grafana dashboards for ticket volume, resolution time, and SLA tracking
- **Complete Ticket Lifecycle** — Create, assign, resolve, close with full audit trail

## Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────┐
│   React (Vite)  │◄──────►│  Django REST API  │◄──────►│ PostgreSQL  │
│   + i18next     │  REST  │  + Celery Workers │        │ (TimescaleDB)│
└─────────────────┘        └────────┬─────────┘        └─────────────┘
                                    │
                           ┌────────┴─────────┐
                           │                  │
                     ┌─────▼─────┐    ┌───────▼──────┐
                     │   Redis   │    │  Prometheus   │
                     │  (Broker) │    │  + Grafana    │
                     └───────────┘    └──────────────┘
```

**7 services** orchestrated via Docker Compose: React frontend (Nginx), Django API, Celery worker, PostgreSQL, Redis, Prometheus, Grafana.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, i18next, Axios |
| Backend | Django 5, Django REST Framework |
| Task Queue | Celery + Redis |
| Database | PostgreSQL (TimescaleDB) |
| AI | OpenAI API, vector embeddings, RAG-based similarity search |
| Monitoring | Prometheus, Grafana, django-prometheus |
| Infrastructure | Docker Compose, Nginx |
| CI | GitHub Actions |

## Quick Start

```bash
# Clone and start all 7 services
git clone https://github.com/yaowubarbara/it-ticketing-system.git
cd it-ticketing-system
docker compose up --build -d

# Run migrations and create admin
docker compose exec backend python manage.py migrate
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

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` `POST` | `/api/tickets/` | List / create tickets |
| `GET` `PATCH` `DELETE` | `/api/tickets/<id>/` | Ticket detail |
| `POST` | `/api/tickets/<id>/assign/` | Assign to IT staff |
| `POST` | `/api/tickets/<id>/resolve/` | Mark as resolved |
| `POST` | `/api/tickets/<id>/close/` | Close ticket |
| `GET` `POST` | `/api/employees/` | List / create employees |
| `GET` `POST` | `/api/knowledge-base/` | Knowledge articles |

## Project Structure

```
├── backend/
│   ├── config/              # Django settings, URL routing, Celery config
│   ├── ticketing/
│   │   ├── models.py        # Ticket, Employee, KnowledgeBase, AIResponse
│   │   ├── views.py         # DRF ViewSets with lifecycle actions
│   │   ├── serializers.py   # REST serializers
│   │   ├── tasks.py         # Celery async AI analysis tasks
│   │   └── tests/           # API and model tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Dashboard, TicketList, TicketDetail, CreateTicket
│   │   ├── services/api.js  # Axios API client
│   │   └── i18n/            # i18next configuration
│   └── public/locales/      # Translation files (zh/en/fr/nl)
├── monitoring/
│   ├── prometheus.yml       # Scrape config for Django metrics
│   └── grafana-datasources.yml
├── docker-compose.yml       # 7-service orchestration
└── .github/workflows/       # CI pipeline
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

# Frontend (separate terminal)
cd frontend
npm install && npm run dev
```

## License

MIT
