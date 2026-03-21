# Complete Setup Guide for ResuMatch Backend

## Prerequisites
- Python 3.9+
- PostgreSQL 12+
- Git

## Step 1: Database Setup

### On Windows (using PostgreSQL):
\`\`\`bash
# Open PostgreSQL command line
psql -U postgres

# Create database and user
CREATE DATABASE resumatch_db;
CREATE USER resumatch_user WITH PASSWORD 'your_secure_password_here';
ALTER ROLE resumatch_user SET client_encoding TO 'utf8';
ALTER ROLE resumatch_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE resumatch_user SET default_transaction_deferrable TO on;
ALTER ROLE resumatch_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE resumatch_db TO resumatch_user;
\\q
\`\`\`

### On Mac (using Homebrew):
\`\`\`bash
brew install postgresql
brew services start postgresql
createdb resumatch_db
psql resumatch_db
CREATE USER resumatch_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE resumatch_db TO resumatch_user;
\\q
\`\`\`

### On Linux (Ubuntu/Debian):
\`\`\`bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres psql

CREATE DATABASE resumatch_db;
CREATE USER resumatch_user WITH PASSWORD 'your_secure_password_here';
ALTER ROLE resumatch_user SET client_encoding TO 'utf8';
ALTER ROLE resumatch_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE resumatch_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE resumatch_db TO resumatch_user;
\\q
\`\`\`

## Step 2: Python Environment Setup

\`\`\`bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\\Scripts\\activate
# On Mac/Linux:
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Download spaCy model (required for resume parsing)
python -m spacy download en_core_web_sm
\`\`\`

## Step 3: Environment Configuration

Create \`.env\` file in backend directory:

\`\`\`env
# Django Settings
SECRET_KEY=generate-with-python-command-below
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=resumatch_db
DB_USER=resumatch_user
DB_PASSWORD=your_secure_password_here
DB_HOST=localhost
DB_PORT=5432

# CORS (React Frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# JWT Authentication
JWT_SECRET_KEY=generate-with-python-command-below
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_EXPIRATION_DAYS=7

# File Upload
MAX_RESUME_SIZE_MB=5
ALLOWED_RESUME_EXTENSIONS=pdf,doc,docx

# Optional: ML Models (for advanced features)
HUGGINGFACE_API_KEY=your_huggingface_token_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Redis (for caching)
REDIS_URL=redis://localhost:6379/0
\`\`\`

### Generate SECRET_KEY and JWT_SECRET_KEY:

\`\`\`bash
# In Python shell:
python
>>> from django.core.management.utils import get_random_secret_key
>>> print(get_random_secret_key())
# Copy the output and paste into SECRET_KEY
>>> exit()

# For JWT_SECRET_KEY:
python -c "import secrets; print(secrets.token_urlsafe(50))"
\`\`\`

## Step 4: Database Migrations

\`\`\`bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (optional, for admin panel)
python manage.py createsuperuser
\`\`\`

## Step 5: Start Django Server

\`\`\`bash
# Run development server
python manage.py runserver

# Server will be running at http://localhost:8000
# API endpoints: http://localhost:8000/api/
# Admin panel: http://localhost:8000/admin/
# API Docs: http://localhost:8000/api/docs/
\`\`\`

## Step 6: React Frontend Setup

In the root directory (not backend):

\`\`\`bash
# Install dependencies
npm install

# Create .env.local file
# Add: NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start React development server
npm run dev

# Frontend will be running at http://localhost:3000
\`\`\`

## Testing the Integration

### Test 1: User Registration
\`\`\`bash
curl -X POST http://localhost:8000/api/users/register/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@test.com",
    "password": "Test@123456",
    "user_type": "candidate"
  }'
\`\`\`

Expected Response:
\`\`\`json
{
  "user": {
    "id": 1,
    "email": "john@test.com",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "candidate"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
\`\`\`

### Test 2: User Login
\`\`\`bash
curl -X POST http://localhost:8000/api/users/login/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john@test.com",
    "password": "Test@123456"
  }'
\`\`\`

### Test 3: Resume Upload
\`\`\`bash
# First, get access token from login response above
# Then:

curl -X POST http://localhost:8000/api/resumes/upload/ \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -F "file=@resume.pdf" \\
  -F "title=My Resume"
\`\`\`

Expected Response:
\`\`\`json
{
  "id": 1,
  "title": "My Resume",
  "ai_score": 78,
  "skills_identified": ["Python", "Django", "React", "PostgreSQL"],
  "experience_level": "mid",
  "job_titles": ["Software Engineer"],
  "extracted_text": "...",
  "ai_feedback": {
    "overall": "Good resume, room for improvement",
    "skills": "Found 4 relevant skills",
    "experience": "Identified as mid level professional"
  }
}
\`\`\`

## Troubleshooting

### Issue: "could not connect to server: Connection refused"
**Solution**: Make sure PostgreSQL is running
- Windows: Services app → PostgreSQL → Start
- Mac: \`brew services start postgresql\`
- Linux: \`sudo service postgresql start\`

### Issue: "ModuleNotFoundError: No module named 'spacy'"
**Solution**: Install requirements: \`pip install -r requirements.txt\`

### Issue: "CORS Error" in browser console
**Solution**: Update \`CORS_ALLOWED_ORIGINS\` in .env to match your frontend URL

### Issue: "No module named 'django'"
**Solution**: Activate virtual environment: \`source venv/bin/activate\`

### Issue: "Resume ML not working"
**Solution**: 
1. Download spaCy model: \`python -m spacy download en_core_web_sm\`
2. Check HuggingFace API key in .env
3. Check internet connection (models are downloaded on first use)

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| SECRET_KEY | Django security key | Auto-generated |
| DEBUG | Enable debug mode | True (dev), False (production) |
| DB_NAME | PostgreSQL database name | resumatch_db |
| DB_USER | PostgreSQL user | resumatch_user |
| DB_PASSWORD | PostgreSQL password | your_password |
| CORS_ALLOWED_ORIGINS | Allowed frontend URLs | http://localhost:3000 |
| HUGGINGFACE_API_KEY | For resume analysis | hf_xxxx... |
| OPENAI_API_KEY | For job descriptions | sk-xxxx... |

## Next Steps

1. Register a user via React frontend (http://localhost:3000/register)
2. Upload a resume
3. Check if scores are generated
4. View job matches
5. Explore recruiter dashboard features

For questions or issues, check the DEBUG_AND_FIXES.md file!
