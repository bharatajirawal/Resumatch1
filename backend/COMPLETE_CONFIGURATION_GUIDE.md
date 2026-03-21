# ResuMatch Backend - Complete Configuration Guide
## College Project Setup (All Free Tier Services)

---

## 1. DJANGO CORE CONFIGURATION

### 1.1 Generate SECRET_KEY
Run this command in your terminal:
\`\`\`bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
\`\`\`
**Example output:**
\`\`\`
ej!n#_@9*l$k%^&jk@9l-_+0=9l$k%^&jk@9l-_+0
\`\`\`
Add this to your `.env` file:
\`\`\`env
SECRET_KEY=ej!n#_@9*l$k%^&jk@9l-_+0=9l$k%^&jk@9l-_+0
\`\`\`

### 1.2 DEBUG Mode
For development (college project):
\`\`\`env
DEBUG=True
\`\`\`
For production:
\`\`\`env
DEBUG=False
\`\`\`

### 1.3 ALLOWED_HOSTS
For local development:
\`\`\`env
ALLOWED_HOSTS=localhost,127.0.0.1
\`\`\`
For production (replace with your domain):
\`\`\`env
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
\`\`\`

---

## 2. DATABASE CONFIGURATION (PostgreSQL)

### 2.1 Install PostgreSQL
**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run installer, remember your password

**Mac:**
\`\`\`bash
brew install postgresql
\`\`\`

**Linux (Ubuntu/Debian):**
\`\`\`bash
sudo apt-get install postgresql postgresql-contrib
\`\`\`

### 2.2 Create Database & User
Open PostgreSQL command line (psql):

**Windows:** Search for "SQL Shell (psql)" in Start menu
**Mac/Linux:** Run `psql`

Then execute:
\`\`\`sql
-- Create database
CREATE DATABASE resumatch_db;

-- Create user
CREATE USER resumatch_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
ALTER ROLE resumatch_user SET client_encoding TO 'utf8';
ALTER ROLE resumatch_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE resumatch_user SET default_transaction_deferrable TO on;
ALTER ROLE resumatch_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE resumatch_db TO resumatch_user;
\`\`\`

### 2.3 Add to .env
\`\`\`env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=resumatch_db
DB_USER=resumatch_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
\`\`\`

---

## 3. JWT AUTHENTICATION

### 3.1 Generate JWT_SECRET_KEY
\`\`\`bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
\`\`\`

**Example output:**
\`\`\`
Drmhze6EPcv0fN_81Bj-nA_zxvDWPK3SQ0VB8TaJk_I
\`\`\`

### 3.2 Add to .env
\`\`\`env
JWT_SECRET_KEY=Drmhze6EPcv0fN_81Bj-nA_zxvDWPK3SQ0VB8TaJk_I
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_EXPIRATION_DAYS=7
\`\`\`

---

## 4. CORS CONFIGURATION (Connect Frontend)

Your React frontend is running on `http://localhost:3000`

### Add to .env
\`\`\`env
CORS_ALLOWED_ORIGINS=http://localhost:3000
\`\`\`

For multiple frontend URLs (comma-separated):
\`\`\`env
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com,https://www.yourdomain.com
\`\`\`

---

## 5. FILE UPLOAD CONFIGURATION

### 5.1 Resume Upload Settings
\`\`\`env
MAX_RESUME_SIZE_MB=5
ALLOWED_RESUME_EXTENSIONS=pdf,doc,docx
\`\`\`

**Note:** Resumes will be saved in `backend/media/resumes/` directory

---

## 6. EMAIL CONFIGURATION (Gmail - College Project)

### 6.1 Generate Gmail App Password
For Gmail, you CANNOT use your regular password. Follow these steps:

1. Go to https://myaccount.google.com/
2. Click "Security" in left sidebar
3. Enable "2-Step Verification" (if not already enabled)
4. Scroll down and find "App passwords"
5. Select "Mail" and "Windows Computer" (or your device)
6. Google will generate a 16-character password
7. Copy this password (spaces included)

### 6.2 Add to .env
\`\`\`env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
\`\`\`

**Example:**
\`\`\`env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=student123@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
\`\`\`

### Alternative Email Providers (College Project):
**Brevo (formerly Sendinblue) - Free tier 300 emails/day:**
- Go to https://www.brevo.com
- Sign up and verify email
- Navigate to SMTP & API section
- Copy SMTP credentials

\`\`\`env
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-brevo-smtp-key
\`\`\`

---

## 7. HUGGINGFACE API (Resume Analysis)

### 7.1 Get Free HuggingFace API Token
1. Go to https://huggingface.co/
2. Click "Sign up" or "Log in"
3. Create account with email
4. Go to https://huggingface.co/settings/tokens
5. Click "New token"
6. Name it "ResuMatch"
7. Copy the token (starts with `hf_`)

### 7.2 Add to .env
\`\`\`env
HUGGINGFACE_API_KEY=hf_abcdefghijklmnopqrstuvwxyz
\`\`\`

**What this does in the app:**
- Used for resume skill extraction
- Analyzes resume text for technical skills
- FREE tier is unlimited for inference API

---

## 8. OPENAI API (Job Description Generator)

### 8.1 Get OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### 8.2 Set Free Credit/Billing
1. Go to https://platform.openai.com/account/billing/overview
2. Add payment method (required but won't charge unless you increase usage limit)
3. Go to "Usage limits" and set monthly limit to $5 for college project

### 8.3 Add to .env
\`\`\`env
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz
\`\`\`

**Cost for College Project:**
- GPT-3.5-turbo: ~$0.0005 per 1000 tokens
- 1000 job descriptions = ~$0.50

---

## 9. REDIS CACHING (Optional)

For college project, skip this - Django's default caching is fine.

If you want Redis:
1. Install Redis from https://redis.io/download
2. Add to .env:
\`\`\`env
REDIS_URL=redis://localhost:6379/0
\`\`\`

---

## COMPLETE EXAMPLE .env (College Project Setup)

\`\`\`env
# ============================================
# DJANGO CORE
# ============================================
DEBUG=True
SECRET_KEY=ej!n#_@9*l$k%^&jk@9l-_+0=9l$k%^&jk@9l-_+0
ALLOWED_HOSTS=localhost,127.0.0.1

# ============================================
# DATABASE (PostgreSQL)
# ============================================
DB_ENGINE=django.db.backends.postgresql
DB_NAME=resumatch_db
DB_USER=resumatch_user
DB_PASSWORD=secure_password_here
DB_HOST=localhost
DB_PORT=5432

# ============================================
# CORS (React Frontend)
# ============================================
CORS_ALLOWED_ORIGINS=http://localhost:3000

# ============================================
# JWT AUTHENTICATION
# ============================================
JWT_SECRET_KEY=Drmhze6EPcv0fN_81Bj-nA_zxvDWPK3SQ0VB8TaJk_I
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_EXPIRATION_DAYS=7

# ============================================
# FILE UPLOAD
# ============================================
MAX_RESUME_SIZE_MB=5
ALLOWED_RESUME_EXTENSIONS=pdf,doc,docx

# ============================================
# EMAIL (Gmail with App Password)
# ============================================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password

# ============================================
# ML MODELS (Optional)
# ============================================
HUGGINGFACE_API_KEY=hf_abcdefghijklmnopqrstuvwxyz
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz

# ============================================
# REDIS (Optional - skip for college)
# ============================================
REDIS_URL=
\`\`\`

---

## SETUP CHECKLIST

- [ ] Generate SECRET_KEY and add to .env
- [ ] Install PostgreSQL
- [ ] Create database and user using SQL
- [ ] Add database credentials to .env
- [ ] Generate JWT_SECRET_KEY and add to .env
- [ ] Get HuggingFace API key and add to .env
- [ ] Get OpenAI API key and add to .env (optional)
- [ ] Set up Gmail app password and add to .env (optional)
- [ ] Run `python manage.py migrate`
- [ ] Run `python manage.py createsuperuser`
- [ ] Start server: `python manage.py runserver`

---

## TESTING YOUR SETUP

### Test Database Connection
\`\`\`bash
python manage.py shell
>>> from django.db import connection
>>> cursor = connection.cursor()
>>> print("Database connected!")
\`\`\`

### Test Email
\`\`\`bash
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail(
...     'Test Email',
...     'This is a test.',
...     'your-email@gmail.com',
...     ['recipient@gmail.com'],
...     fail_silently=False,
... )
\`\`\`

### Test HuggingFace API
\`\`\`bash
python manage.py shell
>>> import os
>>> print(os.getenv('HUGGINGFACE_API_KEY'))
\`\`\`

---

## TROUBLESHOOTING

### "Database connection failed"
- Check PostgreSQL is running: `psql -U postgres`
- Verify DB_NAME, DB_USER, DB_PASSWORD in .env
- Check DB_HOST is correct

### "Invalid SECRET_KEY"
- SECRET_KEY must be a string
- Regenerate if it contains quotes: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

### "Gmail password not working"
- Use App Password, NOT regular Gmail password
- Must have 2-Step Verification enabled

### "HuggingFace API key not working"
- Token must start with `hf_`
- Check token has not expired
- Visit https://huggingface.co/settings/tokens to regenerate

### "OpenAI API key invalid"
- Token must start with `sk-proj-`
- Check billing is set up
- Verify at https://platform.openai.com/account/api-keys
