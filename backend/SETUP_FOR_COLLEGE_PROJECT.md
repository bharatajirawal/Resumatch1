# ResuMatch Backend Setup - College Project Guide

## Quick Start (5 Minutes)

### 1. Prerequisites
\`\`\`bash
# Check Python version
python --version  # Should be 3.11+

# Install PostgreSQL from: https://www.postgresql.org/download/
\`\`\`

### 2. Clone & Setup
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
\`\`\`

### 3. Database Setup
\`\`\`bash
# Open PostgreSQL (psql) and run:
CREATE DATABASE resumatch_db;
CREATE USER resumatch_user WITH PASSWORD 'resumatch123';
ALTER ROLE resumatch_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE resumatch_db TO resumatch_user;
\`\`\`

### 4. Configure .env
\`\`\`bash
cp .env.example .env
# Edit .env with your settings (see below)
\`\`\`

### 5. Run
\`\`\`bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
\`\`\`

✅ Backend running at http://localhost:8000

---

## .env Configuration for College

### Minimal Setup (Works Offline)
\`\`\`env
DEBUG=True
SECRET_KEY=django-insecure-abcdefghijklmnopqrstuvwxyz123456789
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL
DB_ENGINE=django.db.backends.postgresql
DB_NAME=resumatch_db
DB_USER=resumatch_user
DB_PASSWORD=resumatch123
DB_HOST=localhost
DB_PORT=5432

# Frontend
CORS_ALLOWED_ORIGINS=http://localhost:3000

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_EXPIRATION_DAYS=7

# Files
MAX_RESUME_SIZE_MB=5
ALLOWED_RESUME_EXTENSIONS=pdf,doc,docx
\`\`\`

### With Email (Gmail)
\`\`\`env
# Add to above .env:
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
\`\`\`

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not done)
3. App passwords → Select "Mail" → "Windows Computer"
4. Copy 16-character password

### With ML Models (HuggingFace)
\`\`\`env
# Add to above .env:
HUGGINGFACE_API_KEY=hf_your_token_here
\`\`\`

**Get HuggingFace Token:**
1. Go to https://huggingface.co/
2. Sign up / Login
3. Settings → Tokens → New token
4. Copy token (starts with `hf_`)

### With OpenAI (Job Description Generator)
\`\`\`env
# Add to above .env:
OPENAI_API_KEY=sk-proj-your-key-here
\`\`\`

**Get OpenAI API Key:**
1. Go to https://platform.openai.com/
2. Sign up / Login
3. API keys → Create new secret key
4. Set usage limit to $5/month in Billing

---

## API Endpoints for College Project

### Authentication
- `POST /api/users/register/` - Register candidate/recruiter
- `POST /api/users/login/` - Login user
- `GET /api/users/profile/` - Get user profile

### Resume Management
- `POST /api/resumes/upload/` - Upload resume
- `GET /api/resumes/` - List resumes
- `GET /api/resumes/{id}/analyze/` - Analyze resume
- `DELETE /api/resumes/{id}/` - Delete resume

### Job Management (Recruiters)
- `POST /api/jobs/` - Create job posting
- `GET /api/jobs/` - List jobs
- `PUT /api/jobs/{id}/` - Update job
- `DELETE /api/jobs/{id}/` - Delete job

### Job Matching
- `GET /api/matches/` - Get matches for candidate
- `POST /api/matches/` - Trigger matching algorithm
- `GET /api/matches/{id}/` - Get match details

### Analytics (Admin)
- `GET /api/analytics/dashboard/` - Dashboard metrics
- `GET /api/analytics/hiring-trends/` - Hiring analytics
- `GET /api/analytics/user-stats/` - User statistics

---

## Testing the Backend

### Test 1: Register as Candidate
\`\`\`bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test@123",
    "password_confirm": "Test@123",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "candidate"
  }'
\`\`\`

### Test 2: Register as Recruiter
\`\`\`bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@company.com",
    "password": "Test@123",
    "password_confirm": "Test@123",
    "first_name": "Jane",
    "last_name": "Smith",
    "user_type": "recruiter",
    "recruiter_profile": {
      "company_name": "Tech Corp",
      "industry": "Technology"
    }
  }'
\`\`\`

### Test 3: Login
\`\`\`bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test@123"
  }'
\`\`\`

---

## File Structure
\`\`\`
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── core/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── users/
│   ├── resumes/
│   ├── jobs/
│   ├── matches/
│   └── analytics/
└── ml_models/
    ├── resume_refiner.py
    ├── job_generator.py
    └── matcher.py
\`\`\`

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: No module named 'django'` | Run `pip install -r requirements.txt` |
| `FATAL: Ident authentication failed` | Check PostgreSQL password in .env |
| `psycopg2.OperationalError: could not connect to server` | Ensure PostgreSQL is running |
| `No such file or directory: 'venv'` | Run `python -m venv venv` first |
| `Email sending failed` | Check Gmail app password (not regular password) |
| `HuggingFace API key invalid` | Ensure token starts with `hf_` and is not expired |

---

## Presentation Tips

1. **Show the Problem**: Manual resume screening is inefficient and biased
2. **Demonstrate Solution**: Upload resumes, show instant analysis
3. **Highlight Innovation**:
   - Bias-aware screening
   - Smart job matching
   - Personalized insights
4. **Show Analytics**: Dashboard with hiring metrics
5. **Discuss Future**: Mobile app, video interviews, etc.

---

## For Project Submission

**Include in Report:**
- Problem statement
- System architecture diagram
- Database schema
- API documentation
- Screenshots of dashboards
- Deployment guide
- Future enhancements

**Include in Demo Video:**
- User registration
- Resume upload and analysis
- Job matching results
- Analytics dashboard
- Highlighting bias mitigation

---

**Project Supervisor**: Mr. Rishi Agrawal  
**Department**: CEA  
**Status**: Ready for Deployment & Presentation
\`\`\`

```markdown file="" isHidden
