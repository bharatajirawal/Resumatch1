# Complete Environment Variables Reference

## Required for Development

### Django Core
\`\`\`env
SECRET_KEY=your-super-secret-key-here-min-50-chars
DEBUG=True  # Set to False in production
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
\`\`\`

### Database (PostgreSQL)
\`\`\`env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=resumatch_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
\`\`\`

### CORS Configuration
\`\`\`env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://yourdomain.com
\`\`\`

### JWT Authentication
\`\`\`env
JWT_SECRET_KEY=your-jwt-secret-key-for-token-signing
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_EXPIRATION_DAYS=7
\`\`\`

## Optional but Recommended

### Email Configuration (Gmail)
\`\`\`env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password
\`\`\`

To get Gmail app password:
1. Enable 2-factor authentication on your Google account
2. Go to myaccount.google.com/apppasswords
3. Generate app password for "Mail"
4. Use as EMAIL_HOST_PASSWORD

### AI/ML Services

#### OpenAI (for Job Description Generator)
\`\`\`env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

Get key from: https://platform.openai.com/api-keys

#### HuggingFace (for ML models)
\`\`\`env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

Get key from: https://huggingface.co/settings/tokens

### Redis Configuration
\`\`\`env
REDIS_URL=redis://localhost:6379/0
\`\`\`

For production, use managed Redis service URL

### File Storage (AWS S3) - Optional
\`\`\`env
USE_S3=False
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=resumatch-bucket
AWS_S3_REGION_NAME=us-east-1
\`\`\`

### File Upload Configuration
\`\`\`env
MAX_RESUME_SIZE_MB=5
ALLOWED_RESUME_EXTENSIONS=pdf,doc,docx
\`\`\`

### Application Settings
\`\`\`env
ML_MODEL_RESUME_NAME=bert-base-uncased
ML_MODEL_JOB_DESCRIPTION=gpt-3.5-turbo
\`\`\`

## Environment-Specific Configurations

### Development (.env)
\`\`\`env
DEBUG=True
SECRET_KEY=insecure-dev-key-change-in-production
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
REDIS_URL=redis://localhost:6379/0
\`\`\`

### Production (.env.production)
\`\`\`env
DEBUG=False
SECRET_KEY=generate-long-random-string-here
DB_HOST=your-production-db-host
DB_USER=production_user
DB_PASSWORD=production_secure_password
CORS_ALLOWED_ORIGINS=https://yourdomain.com
REDIS_URL=redis://your-redis-host:6379/0
EMAIL_HOST_PASSWORD=your-production-email-password
\`\`\`

### Testing (.env.test)
\`\`\`env
DEBUG=True
SECRET_KEY=test-key
DB_NAME=resumatch_test_db
DB_USER=test_user
DB_PASSWORD=test_password
USE_S3=False
\`\`\`

## Platform-Specific Setup

### Vercel (Frontend) - Environment Variables
No backend env vars needed on frontend, just API URL:
\`\`\`env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
\`\`\`

### Heroku (Django Deployment)
\`\`\`env
DJANGO_SETTINGS_MODULE=core.settings
DISABLE_COLLECTSTATIC=1
# All other vars as above
\`\`\`

### Railway.app Deployment
\`\`\`env
DATABASE_URL=postgresql://user:pass@host:port/dbname
REDIS_URL=redis://user:pass@host:port
# All other vars as above
\`\`\`

### AWS EC2 Deployment
Set environment variables in:
- `/etc/environment` (system-wide)
- `.env` file in app directory
- Systemd service file

### Docker/Docker Compose
Set in `docker-compose.yml` or `.env` file

## How to Generate Secure Keys

### Generate SECRET_KEY
\`\`\`bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
\`\`\`

### Generate JWT_SECRET_KEY
\`\`\`bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
\`\`\`

### Generate Random String
\`\`\`bash
openssl rand -base64 32
\`\`\`

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use different keys** for SECRET_KEY and JWT_SECRET_KEY
3. **Change all default values** before production
4. **Keep API keys safe** - Don't share or expose
5. **Rotate keys periodically** in production
6. **Use environment variables** for all sensitive data
7. **Enable HTTPS** in production
8. **Use strong passwords** for database and email

## Verification Checklist

- [ ] All required env vars are set
- [ ] Database connection works
- [ ] Redis connection works (if using)
- [ ] Email sends successfully
- [ ] API keys are valid and not expired
- [ ] CORS is configured correctly
- [ ] SSL/TLS enabled in production
- [ ] Secrets are not in version control
- [ ] Different secrets for dev/production
- [ ] All API services are accessible
