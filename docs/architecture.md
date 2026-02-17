# Architecture

## System Overview

```
                         ┌──────────────────────────────────────┐
                         │           Docker Compose             │
                         │                                      │
 ┌───────────┐  HTTP     │  ┌──────────┐      ┌─────────────┐  │
 │  Browser  │──────────▶│  │  Nginx   │─────▶│ Django REST  │  │
 │           │◀──────────│  │  (:80)   │  /api│  (:8000)     │  │
 └───────────┘           │  └──────────┘      └──────┬───────┘  │
                         │   React SPA           │        │     │
                         │   (static build)      │        │     │
                         │                       ▼        ▼     │
                         │              ┌─────────┐ ┌────────┐  │
                         │              │  Redis  │ │Postgres│  │
                         │              │ (:6379) │ │(:5432) │  │
                         │              └────┬────┘ └────────┘  │
                         │                   │                  │
                         │              ┌────▼──────────────┐   │
                         │              │  Celery Worker    │   │
                         │              │  ┌──────────────┐ │   │
                         │              │  │SentenceTransf│ │   │
                         │              │  │ (embeddings) │ │   │
                         │              │  └──────────────┘ │   │
                         │              │  ┌──────────────┐ │   │
                         │              │  │Ollama/LLaMA  │ │   │
                         │              │  │ (analysis)   │ │   │
                         │              │  └──────────────┘ │   │
                         │              └───────────────────┘   │
                         │                                      │
                         │  ┌────────────┐  ┌────────────────┐  │
                         │  │ Prometheus │──│    Grafana     │  │
                         │  │  (:9090)   │  │   (:3001)      │  │
                         │  └────────────┘  └────────────────┘  │
                         └──────────────────────────────────────┘
```

## Data Flow: Ticket Lifecycle

### 1. Ticket Creation
```
User submits ticket via React UI
  → POST /api/tickets/
  → TicketSerializer auto-generates ticket_number (TK{YYYYMMDD}{###})
  → Ticket saved to PostgreSQL (status: pending)
  → analyze_ticket_task.delay(ticket_id) enqueued to Redis
  → HTTP 201 returned immediately (non-blocking)
```

### 2. AI Analysis (Celery Worker)
```
Celery picks up analyze_ticket_task
  → Generate embedding via SentenceTransformer (paraphrase-multilingual-MiniLM-L12-v2)
  → Save 384-dim vector to ticket.embedding (JSONField)
  → Search similar closed tickets (cosine similarity > 0.5)
  → Search knowledge base documents (cosine similarity > 0.5)
  → Call Ollama (llama3.2:3b) with ticket + context
  → If LLM succeeds: extract category + solution from response
  → If LLM fails: fallback to rule-based categorization
  → Save AIResponse to PostgreSQL
```

### 3. Assignment
```
IT staff assigns ticket via POST /api/tickets/{id}/assign/
  → Status changes: pending → in_progress
  → TicketHistory record created (audit log)
```

### 4. Resolution
```
IT staff resolves via POST /api/tickets/{id}/resolve/
  → Status changes: in_progress → resolved
  → resolved_at timestamp set
  → TicketHistory record created
```

### 5. Closure
```
User confirms via POST /api/tickets/{id}/close/
  → Requires status == resolved (guard clause)
  → Status changes: resolved → closed
  → closed_at timestamp set
  → Ticket now available for similarity search by future tickets
```

### 6. Knowledge Base Update
```
Admin creates KB article via POST /api/knowledge-base/
  → Article saved to PostgreSQL
  → generate_knowledge_embedding_task.delay(knowledge_id) enqueued
  → Celery generates embedding, saves to knowledge_base.embedding
  → Article now available for RAG similarity search
```

## RAG Pipeline Detail

```
Input ticket text
       │
       ▼
┌──────────────────┐
│ SentenceTransform │  paraphrase-multilingual-MiniLM-L12-v2
│ encode(text)      │  Output: 384-dim float vector
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│Tickets │ │Knowledge │  Both stored as JSONField vectors
│(closed)│ │  Base    │  in PostgreSQL
└───┬────┘ └────┬─────┘
    │           │
    ▼           ▼
┌──────────────────┐
│ cosine_similarity │  Threshold: > 0.5
│ (numpy)           │  Top-k results returned
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Ollama LLaMA 3.2 │  Prompt includes: ticket + similar tickets + KB docs
│ (optional)        │  Output: category suggestion + solution text
└────────┬─────────┘
         │
         ▼
    ┌────┴────┐
    │ Success │──▶ Extract category from LLM response
    │         │    Confidence: 0.80-0.85
    └────┬────┘
    │ Failure │──▶ Rule-based keyword matching (analyze_category)
    │         │    Template solutions (generate_general_solution)
    └─────────┘    Confidence: 0.75
```

## Failure Modes

| Scenario | Detection | Behavior | Code Path |
|----------|-----------|----------|-----------|
| Ollama down | `ollama.chat()` raises exception | Falls back to rule-based categorization | `tasks.py:analyze_ticket_task` → `utils.py:analyze_category` |
| SentenceTransformer fails | `generate_embedding()` returns `None` | Skips similarity search, uses only rule engine | `tasks.py:analyze_ticket_task` (ticket_embedding=None branch) |
| Redis down | Celery cannot connect to broker | Ticket saved but AI analysis never starts | `views.py:perform_create` → task enqueue fails silently |
| PostgreSQL down | Django DB connection error | HTTP 500 on all API endpoints | Django middleware handles DB errors |
| High volume | Celery queue backlog grows | Tickets saved immediately, analysis delayed | Normal Celery backpressure behavior |
| Embedding model download fails | First call to `get_embedding_model()` raises | All subsequent embedding calls return None | `utils.py:generate_embedding` try/except |

## Security Architecture

### Current State
- No authentication: all endpoints are publicly accessible (AllowAny)
- CORS restricted to `localhost:3000` in settings
- CSRF middleware enabled
- Secrets managed via environment variables with `.env` file
- Database passwords use `${VAR:-default}` in docker-compose

### Known Gaps
- No JWT/session authentication on API endpoints
- No rate limiting
- No input sanitization beyond Django/DRF defaults
- Grafana uses default admin credentials
- See [JWT Authentication Proposal](proposals/001-jwt-authentication.md)

## Technology Decision Records

### Why Local LLM (Ollama + LLaMA 3.2)?
- **Privacy**: Ticket data stays on-premises, no external API calls
- **Cost**: No per-token API fees
- **Availability**: Works offline, no internet dependency
- **Trade-off**: Lower quality than GPT-4, but acceptable for triage with fallback

### Why JSONField for Vector Storage?
- **Simplicity**: No pgvector extension required
- **Portability**: Works with standard PostgreSQL
- **Trade-off**: Linear scan instead of ANN index; acceptable at current scale (<10K tickets)
- **Migration path**: Can add pgvector later when scale demands it

### Why Celery for Task Queue?
- **Django ecosystem**: First-class Django integration
- **Redis broker**: Already needed for caching
- **Flexibility**: Easy to add more workers horizontally
- **Eager mode**: `CELERY_TASK_ALWAYS_EAGER=True` for testing without Redis
