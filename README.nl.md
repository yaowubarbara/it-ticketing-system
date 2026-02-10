# IT-ticketingsysteem

[English](./README.md) | [Français](./README.fr.md) | [Nederlands](./README.nl.md) | [中文](./README.zh-CN.md)

Intern IT-support ticketsysteem gebouwd met **Django + DRF + Celery + PostgreSQL + Redis + React + MUI**.

## Functies

- Ticketlevenscyclus: aanmaken, toewijzen, oplossen, sluiten.
- Medewerkersbeheer (CRUD).
- Kennisbank met asynchrone embedding-generatie.
- AI-ondersteunde analyse voor nieuwe tickets.
- Meertalige frontend (`zh`, `en`, `fr`, `nl`).
- Monitoring: Prometheus + Grafana + exporters.

## Snel starten (Docker Compose)

```bash
docker compose up --build -d
```

URL's:

- Frontend: <http://localhost>
- Backend API: <http://localhost:8000/api/>
- Django Admin: <http://localhost:8000/admin/>
- Prometheus: <http://localhost:9090>
- Grafana: <http://localhost:3001> (`admin/admin123`)

## Lokale ontwikkeling

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Celery worker:

```bash
cd backend
celery -A config worker --loglevel=info --pool=solo
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Synchroniseren naar GitHub

```bash
git remote add origin git@github.com:yaowubarbara/it-ticketing-system.git
git push -u origin work
```
