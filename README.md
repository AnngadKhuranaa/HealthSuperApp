# HealthOS

A modular, AI-assisted health screening platform for preliminary self-assessment.

> **Important**: HealthOS provides prototype preliminary screenings only.  
> Results are **not medical diagnoses** and do not replace professional evaluation.

---

## What is implemented

| Feature | Status |
|---------|--------|
| Mental Health Self-Report Screening | ✅ Fully functional |
| Neurological Screening | 🔜 Planned |
| Cardiovascular Screening | 🔜 Planned |
| Voice / audio interaction | 🔜 Future work |

### Mental Health Screening includes:
- 9-question prototype self-report questionnaire (symptom-domain based)
- Server-side scoring (0–27 scale)
- Symptom checklist with accurate status per question
- Structured report with interpretation, next steps, and disclaimer
- Safety response for self-harm item responses > 0
- Partial submission handling
- Consent + instructions screen

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI, Uvicorn |
| Validation | Pydantic v2 |
| Tests | Pytest, HTTPX |
| Frontend | React 18, Vite |
| Styling | Plain CSS (design tokens) |
| Storage | In-memory (no database) |

---

## Prerequisites

- Python 3.11 or 3.12
- Node.js 18+
- npm 9+

---

## Setup & Run

### 1. Clone

```bash
git clone https://github.com/AnngadKhuranaa/HealthSuperApp.git
cd HealthSuperApp
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt

# Copy and edit env if needed
copy .env.example .env

# Start the backend (from the backend/ directory)
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000  
Interactive API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## Running Tests

```bash
cd backend
python -m pytest app/tests/ -v
```

**Test results (as of initial build): 30/30 passed**

Tests cover:
- Health endpoint and root
- Module listing (available/planned status)
- Questionnaire info structure
- Score calculation for known inputs (0, 1, 3, partial)
- Score boundary conditions
- Score interpretation bands
- Safety flag detection (q9 self-harm item)
- Checklist status accuracy (reported / not_reported / not_answered)
- Valid complete and zero-score submissions
- Invalid response values (5, -1) — rejected with 422
- Missing consent — rejected with 422
- Partial submissions — accepted, flagged as partial
- Empty answer submissions
- Safety message presence/absence
- Report structure completeness
- Score injection prevention (unknown question keys ignored)

---

## API Reference

### GET /

Returns basic app information.

### GET /api/health

```json
{ "status": "ok", "service": "HealthOS Backend", "timestamp": "..." }
```

### GET /api/modules

Returns all screening modules with status (`available` / `planned`).

### GET /api/mental-health/info

Returns questionnaire definition, response options, questions, scoring bands, limitations.

### POST /api/mental-health/sessions

**Request:**
```json
{
  "consented": true,
  "answers": {
    "q1": 1,
    "q2": 0,
    "q3": 2,
    "q4": 1,
    "q5": 0,
    "q6": 1,
    "q7": 0,
    "q8": 1,
    "q9": 0
  }
}
```

**Response (201):** `ScreeningReport` — includes score, interpretation, symptom checklist, next steps, safety message (if applicable), disclaimer.

**Errors:**
- `422` — Invalid response values, values out of 0–3 range, or no consent

---

## Privacy & Safety

- No personal identifiers are collected
- Session data is in-memory only — not persisted to a database
- Questionnaire answers are not logged
- A visible safety response is shown if the self-harm question (q9) is answered > 0
- The application cannot determine whether a user is safe — it directs to crisis resources

**Crisis contacts (India):**
- iCall: 9152987821
- Vandrevala Foundation: 1860-2662-345 (24/7)

---

## Limitations & Future Work

- The questionnaire is a **prototype** — it is not a validated clinical instrument
- Score interpretation bands are illustrative only
- No authentication or session persistence
- No longitudinal tracking
- No voice functionality (planned)
- Neurological and cardiovascular modules are not implemented
- No mobile responsive design refinements yet
- Not suitable for clinical deployment without proper validation and compliance review

---

## Questionnaire Attribution

The questionnaire used in this prototype is an original instrument created for the HealthOS
demonstration. It is **not** the PHQ-9, GAD-7, or any other proprietary or licensed instrument.
Question domains (mood, sleep, energy, appetite, concentration, self-worth, psychomotor changes,
self-harm) are drawn from publicly available mental health literature.
