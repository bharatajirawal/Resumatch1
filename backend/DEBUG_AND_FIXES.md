# Debug Report: Signup and Resume Scoring Issues

## Issues Found

### 1. Frontend Signup Not Connected to Backend
**Problem**: React registration page is using `setTimeout` mock instead of calling the Django API.
**Location**: `app/register/page.tsx`
**Fix**: Connect to actual Django API endpoint

### 2. Resume Upload Not Connected to Backend
**Problem**: React component uses mock upload instead of calling the API.
**Location**: `components/resume-upload.tsx`
**Fix**: Connect to actual resume upload endpoint

### 3. ML Models Dependencies Missing
**Problem**: `resume_refiner.py` imports models but they may not be installed correctly.
**Issues**:
- `spacy` model not downloaded: `python -m spacy download en_core_web_sm`
- `transformers` models need HuggingFace token
- `PyPDF2` and `python-docx` not verified

## Solutions

### Step 1: Install Missing ML Dependencies
\`\`\`bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
\`\`\`

### Step 2: Create Debug Test Script
Run this to test if ML models work:
\`\`\`bash
python manage.py shell
from ml_models.resume_refiner import ResumeRefiner
refiner = ResumeRefiner()
print("ML models loaded successfully!")
\`\`\`

### Step 3: Update Environment Variables
\`\`\`env
HUGGINGFACE_API_KEY=your_hf_token
OPENAI_API_KEY=your_openai_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
\`\`\`

### Step 4: Run Database Migrations
\`\`\`bash
python manage.py makemigrations
python manage.py migrate
\`\`\`

### Step 5: Test API Endpoints
\`\`\`bash
# Test signup
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@test.com",
    "password": "Test@123",
    "user_type": "candidate"
  }'

# Expected response:
# {"user": {...}, "access": "token_here", "refresh": "refresh_token"}
\`\`\`

## Testing Resume Upload

1. Get access token from signup response
2. Upload resume file:
\`\`\`bash
curl -X POST http://localhost:8000/api/resumes/upload/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@resume.pdf" \
  -F "title=My Resume"

# Expected response:
# {"id": 1, "ai_score": 75, "skills_identified": [...], ...}
\`\`\`

## If Issues Persist

### Debug Checklist
- [ ] PostgreSQL running: `psql -U postgres -d resumatch_db`
- [ ] Django migrations applied: `python manage.py showmigrations`
- [ ] Environment variables loaded: `echo $HUGGINGFACE_API_KEY`
- [ ] Django development server running on 8000
- [ ] React frontend configured to call `http://localhost:8000/api/`
- [ ] CORS properly configured
- [ ] ML model files cached (first load is slow)

### Common Errors & Fixes

**Error**: `Connection refused localhost:8000`
- Fix: Run `python manage.py runserver`

**Error**: `ModuleNotFoundError: No module named 'spacy'`
- Fix: Run `pip install -r requirements.txt`

**Error**: `OperationalError: could not connect to server: Connection refused`
- Fix: Start PostgreSQL: `sudo service postgresql start`

**Error**: `CORS Error from React frontend`
- Fix: Check `.env` has correct `CORS_ALLOWED_ORIGINS=http://localhost:3000`
