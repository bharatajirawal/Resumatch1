# Environment Variables Setup Guide

This file explains all environment variables needed to run the ResuMatch backend.

## Quick Start

1. Copy `.env.example` to `.env`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Fill in the values based on your setup (see below)

3. Run migrations:
   \`\`\`bash
   python manage.py migrate
   \`\`\`

## Required Variables (Must Set)

### Django Core
- `SECRET_KEY`: Generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- `DEBUG`: Set to `False` for production, `True` for development
- `ALLOWED_HOSTS`: Your domain(s), comma-separated

### Database (PostgreSQL)
- `DB_NAME`: Your PostgreSQL database name
- `DB_USER`: PostgreSQL user
- `DB_PASSWORD`: PostgreSQL password
- `DB_HOST`: PostgreSQL host (usually `localhost` for local development)
- `DB_PORT`: PostgreSQL port (usually `5432`)

### CORS (Frontend Connection)
- `CORS_ALLOWED_ORIGINS`: Your React frontend URL(s), comma-separated
  - Example: `http://localhost:3000,https://yourdomain.com`

### JWT Authentication
- `JWT_SECRET_KEY`: Generate with `python -c "import secrets; print(secrets.token_urlsafe(50))"`
- `JWT_EXPIRATION_HOURS`: Access token lifetime (default: 24)
- `JWT_EXPIRATION_DAYS`: Refresh token lifetime (default: 7)

## File Upload Configuration

- `MAX_RESUME_SIZE_MB`: Maximum resume file size in MB (default: 5)
- `ALLOWED_RESUME_EXTENSIONS`: Allowed file types, comma-separated (default: `pdf,doc,docx`)

## Optional Variables

### ML Models
Leave empty if not using these services:
- `HUGGINGFACE_API_KEY`: For HuggingFace transformer models (optional)
- `OPENAI_API_KEY`: For GPT models in job description generator (optional)

### Redis/Caching
- `REDIS_URL`: Redis connection string (optional, defaults to local cache)
  - Example: `redis://localhost:6379/0`

### Email (For Notifications)
Only configure if you need email functionality:
- `EMAIL_BACKEND`: Email backend service
- `EMAIL_HOST`: SMTP server
- `EMAIL_PORT`: SMTP port (usually 587 or 465)
- `EMAIL_USE_TLS`: Use TLS encryption (True/False)
- `EMAIL_HOST_USER`: Email account
- `EMAIL_HOST_PASSWORD`: Email password or app-specific password

## Example .env Configuration

\`\`\`
# Development Setup
DEBUG=True
SECRET_KEY=your-generated-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL
DB_NAME=resumatch
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

# Frontend
CORS_ALLOWED_ORIGINS=http://localhost:3000

# JWT
JWT_SECRET_KEY=your-generated-jwt-key
JWT_EXPIRATION_HOURS=24
JWT_EXPIRATION_DAYS=7

# Files
MAX_RESUME_SIZE_MB=5
ALLOWED_RESUME_EXTENSIONS=pdf,doc,docx
\`\`\`

## Next Steps

1. Create your PostgreSQL database
2. Update `.env` with your database credentials
3. Run `python manage.py migrate` to set up database tables
4. Run `python manage.py createsuperuser` to create an admin user
5. Start the server: `python manage.py runserver`
