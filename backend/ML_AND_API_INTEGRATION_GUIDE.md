# ML Models & API Integration Guide - ResuMatch

## Overview
This document explains how HuggingFace, OpenAI, and ML models are integrated into the ResuMatch backend.

---

## Architecture Overview

\`\`\`
┌─────────────────────┐
│   React Frontend    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│   Django REST API                   │
│  (backend/apps/resumes/views.py)    │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│   ML Models (backend/ml_models/)            │
│   ├── ResumeRefiner (HuggingFace Models)    │
│   ├── JobMatcher (scikit-learn)             │
│   └── JobDescriptionGenerator (OpenAI)      │
└─────────────────────────────────────────────┘
\`\`\`

---

## 1. RESUME REFINER (HuggingFace Models)

### Where It's Used
- **File**: `backend/ml_models/resume_refiner.py`
- **Triggered**: When a user uploads a resume via `/api/resumes/upload/`

### HuggingFace Models Used
\`\`\`python
# NER (Named Entity Recognition) - Identifies job titles, companies, locations
self.ner_pipeline = pipeline("ner", model="dslim/bert-base-uncased-finetuned-ner")

# Summarization - Creates resume summary
self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# spaCy - NLP processing for text analysis
self.nlp = spacy.load('en_core_web_sm')
\`\`\`

### What It Does
1. **Extracts Text** from PDF/DOCX files
2. **Identifies Skills** - Matches against 30+ technical skills
3. **Extracts Job Titles** - Using NER model
4. **Calculates Score** (0-100) based on:
   - Number of skills (max 20 points)
   - Number of job experiences (max 15 points)
   - Resume length (max 10 points)
5. **Identifies Strengths & Weaknesses**
6. **Generates Suggestions** for improvement

### API Flow
\`\`\`
POST /api/resumes/upload/
├── ResumeRefiner.extract_text(file)
├── ResumeRefiner.analyze_resume(text)
│   ├── Extract skills
│   ├── Extract job titles
│   ├── Calculate experience level
│   ├── Calculate score
│   ├── Generate feedback
│   └── Generate suggestions
└── Save analysis in database
\`\`\`

### Example Response
\`\`\`json
{
  "id": 1,
  "file": "/media/resumes/resume.pdf",
  "ai_score": 78,
  "ai_feedback": {
    "overall": "Good resume, room for improvement",
    "skills": "Found 8 relevant skills",
    "experience": "Identified as mid level professional"
  },
  "skills_identified": ["python", "django", "react", "sql", "docker"],
  "experience_level": "mid",
  "job_titles": ["Software Engineer", "Full Stack Developer"]
}
\`\`\`

---

## 2. JOB DESCRIPTION GENERATOR (OpenAI API)

### Where It's Used
- **File**: `backend/ml_models/job_description_generator.py`
- **Triggered**: When a recruiter creates/edits a job posting

### OpenAI Configuration
\`\`\`python
# Uses OpenAI API key from settings
self.openai_api_key = settings.OPENAI_API_KEY

# Model: GPT-3.5-turbo
model = "gpt-3.5-turbo"

# Temperature: 0.7 (creative but consistent)
temperature = 0.7
\`\`\`

### What It Does
Takes a basic job description and enhances it to be:
- More attractive to candidates
- Better structured
- Include key responsibilities
- Include what we're looking for
- Include why join us

### API Flow
\`\`\`
POST /api/jobs/create/
├── JobDescriptionGenerator.generate(title, description, requirements)
├── Build prompt for OpenAI
├── Call OpenAI API
│   └── POST https://api.openai.com/v1/chat/completions
├── Fallback to simple generation if API fails
└── Save enhanced description in database
\`\`\`

### Example Prompt
\`\`\`
Enhance the following job description to make it more attractive to candidates while being clear and professional:

Job Title: Senior Python Developer
Current Description: Need an experienced Python developer
Requirements: Python, Django, PostgreSQL
Required Skills: Python, Django, FastAPI, SQL

Please provide:
1. An enhanced job description (2-3 paragraphs)
2. Key responsibilities (3-5 points)
3. What we're looking for (3-5 points)
4. Why join us (2-3 points)
\`\`\`

---

## 3. JOB MATCHER (scikit-learn + ML)

### Where It's Used
- **File**: `backend/ml_models/job_matcher.py`
- **Triggered**: On candidate dashboard to show job matches

### Algorithm
\`\`\`python
match_score = (skill_match * 0.5) + (experience_match * 0.3) + location_match + salary_match

# Skill Match: TF-IDF cosine similarity
skill_match = (matched_skills / total_required_skills) * 100

# Experience Match: Level-based scoring
required_years = exp_mapping.get(job_exp_level)
experience_match = (candidate_exp / required_years) * 100

# Location & Salary: Boolean (True/False)
\`\`\`

### What It Does
1. Matches candidate resume to all active jobs
2. Calculates skill match percentage
3. Calculates experience match
4. Checks location compatibility
5. Checks salary expectations
6. Generates match reasons
7. Stores matches in database (40%+ score only)

---

## Environment Variables Setup

### Required for HuggingFace
\`\`\`env
# Not required - models are free and auto-downloaded on first use
# First run will download ~500MB of models
\`\`\`

### Required for OpenAI
\`\`\`env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
\`\`\`

Get your key from: https://platform.openai.com/api-keys

---

## Debugging ML Issues

### Problem: Resume Upload Returns Error

**Symptom**: Upload endpoint returns 400 error

**Check These**:
\`\`\`bash
# 1. Check if spaCy model is installed
python -m spacy download en_core_web_sm

# 2. Check if transformers models download correctly
python -c "from transformers import pipeline; pipeline('ner')"

# 3. Check file permissions
# Your media/resumes/ folder must be writable

# 4. Check file type
# Only PDF and DOCX supported

# 5. See backend logs
python manage.py runserver  # Look for error messages
\`\`\`

### Problem: Resume Analysis Shows Default Values

**Symptom**: Score is always 50, no skills detected

**Cause**: HuggingFace models not loaded correctly

**Fix**:
\`\`\`bash
# Reinstall transformers and torch
pip install --upgrade transformers torch

# Clear cache
rm -rf ~/.cache/huggingface/

# Re-run to redownload models
python manage.py shell
>>> from ml_models.resume_refiner import ResumeRefiner
>>> r = ResumeRefiner()  # This will download models
\`\`\`

### Problem: Job Description Generation Fails

**Symptom**: Job posting doesn't get enhanced description

**Check**:
\`\`\`bash
# 1. Check if OPENAI_API_KEY is set
echo $OPENAI_API_KEY

# 2. Test API key validity
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# 3. Check API rate limits
# Go to: https://platform.openai.com/account/usage/overview

# 4. Check for API errors in logs
# Should show "OpenAI API error: ..." if fails
\`\`\`

### Problem: No Job Matches Found

**Symptom**: Candidate sees 0 matches

**Check**:
\`\`\`python
# SSH into Django shell
python manage.py shell

# Check if jobs exist
from apps.jobs.models import Job
Job.objects.filter(is_active=True).count()

# Check if candidate has primary resume
from apps.resumes.models import Resume
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(username="candidate_username")
Resume.objects.filter(user=user, is_primary=True).exists()

# Check match algorithm
from ml_models.job_matcher import JobMatcher
matcher = JobMatcher()
matches = matcher.find_matches_for_candidate(user)
len(matches)
\`\`\`

---

## Testing ML Models Locally

### Test Resume Analyzer
\`\`\`python
from ml_models.resume_refiner import ResumeRefiner

refiner = ResumeRefiner()
# With actual file
with open('sample_resume.pdf', 'rb') as f:
    text = refiner.extract_text(f)
    analysis = refiner.analyze_resume(text)
    print(analysis)

# With sample text
sample_text = """
Senior Software Engineer with 7 years experience.
Skills: Python, Django, React, PostgreSQL, Docker, Kubernetes
Experience: Google, Microsoft, Startup XYZ
"""
analysis = refiner.analyze_resume(sample_text)
print(f"Score: {analysis['score']}")
print(f"Skills: {analysis['skills']}")
\`\`\`

### Test Job Matcher
\`\`\`python
from ml_models.job_matcher import JobMatcher
from apps.jobs.models import Job
from django.contrib.auth import get_user_model

User = get_user_model()
matcher = JobMatcher()

# Get a candidate
candidate = User.objects.filter(user_type='candidate').first()

# Find matches
matches = matcher.find_matches_for_candidate(candidate)
print(f"Found {len(matches)} matches")
for match in matches:
    print(f"Job: {match.job.title}, Score: {match.match_score}%")
\`\`\`

### Test Job Description Generator
\`\`\`python
from ml_models.job_description_generator import JobDescriptionGenerator

generator = JobDescriptionGenerator()
result = generator.generate(
    title="Senior Python Developer",
    description="We need a Python expert",
    requirements=["Python", "Django", "PostgreSQL"],
    skills=["Python", "Django", "FastAPI", "SQL"]
)
print(result)
\`\`\`

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ModuleNotFoundError: No module named 'spacy'` | Dependencies not installed | `pip install -r requirements.txt` |
| `OSError: [E050] Can't find model "en_core_web_sm"` | spaCy model missing | `python -m spacy download en_core_web_sm` |
| `transformers.utils.generic: Unable to parse response` | Transformers downloading fails | Clear cache: `rm -rf ~/.cache/huggingface/` |
| `{"error": "Incorrect API key provided"}` | Invalid OpenAI key | Check key in `.env` file |
| `Timeout during API call` | Network issue | Check internet, increase timeout in code |
| `No matches found (score < 40)` | Algorithm threshold too high | Check skills, experience level matches |

---

## API Endpoints Using ML

### Upload & Analyze Resume
\`\`\`
POST /api/resumes/upload/
Content-Type: multipart/form-data

{
  "file": <PDF/DOCX file>,
  "title": "My Resume"
}

Response: {
  "id": 1,
  "file": "/media/resumes/...",
  "ai_score": 78,
  "skills_identified": [...],
  "ai_feedback": {...}
}
\`\`\`

### Get Job Matches for Candidate
\`\`\`
GET /api/matches/

Response: [
  {
    "id": 1,
    "job": {...},
    "match_score": 85,
    "skill_match_percentage": 90,
    "experience_match_percentage": 80,
    "reasons": [...]
  }
]
\`\`\`

### Create Job with AI Enhancement
\`\`\`
POST /api/jobs/create/

{
  "title": "Senior Python Developer",
  "description": "Need Python expert",
  "requirements": ["Python", "Django"],
  "skills_required": ["Python", "Django", "PostgreSQL"]
}

Response: {
  "id": 1,
  "title": "Senior Python Developer",
  "description": "<AI-enhanced description>",
  "created_at": "2025-01-20T..."
}
\`\`\`

---

## Performance Notes

| Operation | Time | Memory |
|-----------|------|--------|
| Extract resume text | ~100ms | ~50MB |
| Analyze resume (ML) | ~500ms | ~200MB |
| Calculate match scores | ~200ms per job | ~100MB |
| Generate job description (OpenAI) | ~3-5s | ~50MB |

---

## Next Steps

1. Set up `.env` with OPENAI_API_KEY
2. Run migrations: `python manage.py migrate`
3. Test resume upload via API
4. Monitor logs for any issues
5. Adjust model thresholds if needed

For questions or issues, check Django logs: `python manage.py runserver`
