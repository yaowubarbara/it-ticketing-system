# IT Ticketing System

[English](./README.md) | [Français](./README.fr.md) | [Nederlands](./README.nl.md) | [中文](./README.zh-CN.md)

An AI-powered IT helpdesk ticketing system with a RAG (Retrieval-Augmented Generation) pipeline for intelligent ticket analysis, automatic categorization, and solution suggestions.

## Problem Statement

IT departments handle hundreds of repetitive tickets daily. This system automates first-level triage by combining a local LLM (LLaMA 3.2 via Ollama) with vector similarity search over historical tickets and a knowledge base, reducing mean time to resolution.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 6.0, Django REST Framework |
| Frontend | React 19, Material-UI, Vite |
| AI/ML | LLaMA 3.2 (via Ollama), SentenceTransformers (MiniLM-L12-v2) |
| Task Queue | Celery 5.6 + Redis |
| Database | PostgreSQL 16 |
| Monitoring | Prometheus + Grafana |
| Containerization | Docker Compose |
| CI/CD | GitHub Actions |
| i18n | 4 languages (EN, ZH, FR, NL) |

## Quick Start

```bash
# 1. Clone and configure
git clone <repo-url> && cd it-ticketing-system
cp .env.example .env

# 2. Start all services
docker compose up -d

# 3. Access
#    Frontend:  http://localhost
#    API:       http://localhost:8000/api/
#    Grafana:   http://localhost:3001
```

> **Note:** Ollama is optional. If not available, the system gracefully falls back to a rule-based categorization engine with template solutions.

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   React SPA  │────▶│  Django REST API  │────▶│ PostgreSQL   │
│  (Nginx:80)  │     │    (:8000)        │     │  (:5432)     │
└──────────────┘     └────────┬─────────┘     └──────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Celery Worker    │
                    │                   │
                    │ ┌───────────────┐ │
                    │ │ SentenceTransf│ │     ┌──────────────┐
                    │ │ (Embeddings)  │ │────▶│    Redis      │
                    │ └───────────────┘ │     │   (:6379)     │
                    │ ┌───────────────┐ │     └──────────────┘
                    │ │ Ollama/LLaMA  │ │
                    │ │ (Analysis)    │ │
                    │ └───────────────┘ │
                    └───────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Prometheus +     │
                    │   Grafana          │
                    └───────────────────┘
```

## Key Features

- **AI-Powered Ticket Analysis** - Automatic categorization and solution generation via local LLM
- **RAG Pipeline** - Vector similarity search across historical tickets and knowledge base
- **Multilingual UI** - English, Chinese, French, Dutch with i18n support
- **Async Processing** - Celery workers handle AI analysis without blocking API responses
- **Full Ticket Lifecycle** - Create, assign, resolve, close with audit history
- **Monitoring** - Prometheus metrics + Grafana dashboards
- **Graceful Degradation** - Falls back to rule-based system when LLM is unavailable

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/tickets/` | List / Create tickets |
| GET/PATCH/DELETE | `/api/tickets/<id>/` | Ticket detail |
| POST | `/api/tickets/<id>/assign/` | Assign to IT staff |
| POST | `/api/tickets/<id>/resolve/` | Mark as resolved |
| POST | `/api/tickets/<id>/close/` | Close ticket |
| GET/POST | `/api/employees/` | List / Create employees |
| GET/PATCH/DELETE | `/api/employees/<id>/` | Employee detail |
| GET/POST | `/api/knowledge-base/` | List / Create KB articles |
| GET/PUT/PATCH/DELETE | `/api/knowledge-base/<id>/` | KB article detail |

## Project Structure

```
it-ticketing-system/
├── backend/
│   ├── config/            # Django settings, Celery config, URL routing
│   ├── ticketing/         # Main app: models, views, serializers, tasks, utils
│   │   ├── models.py      # Ticket, Employee, AIResponse, KnowledgeBase, TicketHistory
│   │   ├── views.py       # REST API views and ticket actions
│   │   ├── tasks.py       # Celery tasks (AI analysis, embedding generation)
│   │   ├── utils.py       # Embedding, similarity search, LLM integration
│   │   └── tests/         # Test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # React components (Dashboard, TicketList, etc.)
│   │   ├── services/      # API client (Axios)
│   │   └── i18n/          # Internationalization config
│   ├── Dockerfile
│   └── nginx.conf
├── monitoring/            # Prometheus + Grafana config
├── docker-compose.yml
├── .env.example
└── .github/workflows/     # CI/CD pipeline
```

## Testing

```bash
cd backend

# Run all tests
CELERY_TASK_ALWAYS_EAGER=True pytest -v

# With coverage
CELERY_TASK_ALWAYS_EAGER=True pytest -v --cov=ticketing --cov-report=term-missing
```

## Development

```bash
# Backend (local)
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (local)
cd frontend
npm install
npm run dev

# Lint
cd backend && flake8 ticketing/ config/ --max-line-length=120 --exclude=migrations
cd frontend && npm run lint
```

## Documentation

- [Architecture](docs/architecture.md) - System design, data flow, failure modes
