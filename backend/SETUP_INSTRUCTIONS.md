# ResuMatch Backend Setup Instructions

## Prerequisites
- Python 3.11+
- PostgreSQL 13+
- Redis (optional, for caching)
- pip (Python package manager)

## Installation Steps

### 1. Clone and Navigate to Backend
\`\`\`bash
cd backend
\`\`\`

### 2. Create Virtual Environment
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
\`\`\`

### 3. Install Dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Download ML Models
\`\`\`bash
python -m spacy download en_core_web_sm
\`\`\`

### 5. Setup Environment Variables
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your configuration:

\`\`\`env
# Django Settings
DEBUG=True
SECRET_KEY=your-super-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=resumatch_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# CORS (React Frontend URL)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# JWT Authentication
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Email (Gmail SMTP - for notifications)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password  # Generate at myaccount.google.com/apppasswords

# ML Models
HUGGINGFACE_API_KEY=your-hf-api-key  # Get from huggingface.co
OPENAI_API_KEY=your-openai-api-key  # Get from openai.com

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# AWS S3 (for resume file storage - optional)
USE_S3=False
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=resumatch-bucket
\`\`\`

### 6. Setup PostgreSQL Database

#### Option A: Using PostgreSQL directly
\`\`\`bash
# Create database
createdb resumatch_db

# Or using psql:
psql
# Inside psql:
CREATE DATABASE resumatch_db;
\`\`\`

#### Option B: Using Docker
\`\`\`bash
docker-compose up postgres redis -d
\`\`\`

### 7. Run Database Migrations
\`\`\`bash
python manage.py makemigrations
python manage.py migrate
\`\`\`

### 8. Create Superuser (Admin)
\`\`\`bash
python manage.py createsuperuser
# Follow the prompts to create admin account
\`\`\`

### 9. Collect Static Files
\`\`\`bash
python manage.py collectstatic --noinput
\`\`\`

### 10. Run Development Server
\`\`\`bash
python manage.py runserver
\`\`\`

Server will be available at: `http://localhost:8000`

## Accessing the API

### API Documentation
- Swagger UI: `http://localhost:8000/api/docs/`
- Schema: `http://localhost:8000/api/schema/`

### Django Admin
- URL: `http://localhost:8000/admin/`
- Use superuser credentials from step 8

## Using Docker Compose (Optional)

### Start All Services
\`\`\`bash
docker-compose up
\`\`\`

### Stop Services
\`\`\`bash
docker-compose down
\`\`\`

### View Logs
\`\`\`bash
docker-compose logs django
docker-compose logs postgres
\`\`\`

## Environment Variables Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| DEBUG | Django debug mode (False in production) | True/False |
| SECRET_KEY | Django secret key (keep secure!) | complex-random-string |
| DB_NAME | PostgreSQL database name | resumatch_db |
| DB_USER | PostgreSQL username | postgres |
| DB_PASSWORD | PostgreSQL password | your_secure_password |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| CORS_ALLOWED_ORIGINS | Frontend URLs allowed to access API | http://localhost:3000 |
| JWT_SECRET_KEY | Secret for JWT token signing | complex-random-string |
| OPENAI_API_KEY | OpenAI API key for job description generation | sk-... |
| HUGGINGFACE_API_KEY | HuggingFace API key for ML models | hf_... |
| REDIS_URL | Redis connection URL | redis://localhost:6379/0 |

## Getting API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and paste into .env

### HuggingFace API Key
1. Go to https://huggingface.co/settings/tokens
2. Create new token
3. Copy and paste into .env

### Gmail App Password
1. Enable 2-factor authentication on Google account
2. Go to myaccount.google.com/apppasswords
3. Generate app password for Mail
4. Use as EMAIL_HOST_PASSWORD in .env

## Testing the Setup

### Register a Candidate
\`\`\`bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@test.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "user_type": "candidate",
    "candidate_profile": {
      "headline": "Developer",
      "location": "SF",
      "experience_years": 3,
      "skills": ["Python", "Django"],
      "education": []
    }
  }'
\`\`\`

### Login
\`\`\`bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@test.com",
    "password": "testpass123"
  }'
\`\`\`

## Troubleshooting

### PostgreSQL Connection Error
- Ensure PostgreSQL is running
- Check DB credentials in .env match your PostgreSQL setup
- Verify DB_HOST is correct (localhost for local, docker service name for Docker)

### Import Errors
- Ensure all dependencies installed: `pip install -r requirements.txt`
- Try updating pip: `pip install --upgrade pip`

### ML Model Download Issues
- Run: `python -m spacy download en_core_web_sm`
- Ensure internet connection for model download

### Static Files Not Found
- Run: `python manage.py collectstatic --noinput`

### CORS Errors
- Check CORS_ALLOWED_ORIGINS in .env matches your frontend URL
- Frontend should be at http://localhost:3000 by default

## Production Deployment

For production deployment:

1. Set DEBUG=False in .env
2. Change SECRET_KEY to a strong random value
3. Update ALLOWED_HOSTS with your domain
4. Use PostgreSQL hosted database (not local)
5. Use Redis hosted service
6. Set up SSL/TLS certificate
7. Use environment variables from your hosting provider
8. Run migrations on production database
9. Collect static files
10. Use Gunicorn or similar WSGI server

## Additional Commands

### Create new Django app
\`\`\`bash
python manage.py startapp app_name
\`\`\`

### Run specific migrations
\`\`\`bash
python manage.py migrate app_name
\`\`\`

### Create database backup
\`\`\`bash
pg_dump resumatch_db > backup.sql
\`\`\`

### Access Django shell
\`\`\`bash
python manage.py shell
\`\`\`

## Next Steps

1. Connect React frontend to this API
2. Update CORS_ALLOWED_ORIGINS with your frontend URL
3. Test API endpoints using Swagger UI
4. Monitor logs and performance
