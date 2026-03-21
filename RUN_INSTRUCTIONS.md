# How to Run ResuMatch (Backend & Frontend)

## Prerequisites
- Node.js & npm
- Python 3.9+
- PostgreSQL

## 1. Backend Setup

Open a terminal and navigate to the `backend` folder:
```bash
cd backend
```

### A. Environment Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate it:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

### B. Configuration
Create a file named `.env` in the `backend` folder with the following content (adjust DB credentials as needed):

```env
SECRET_KEY=django-insecure-change-me-for-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL) - Update with your credentials
DB_ENGINE=django.db.backends.postgresql
DB_NAME=resumatch_db
DB_USER=resumatch_user
DB_PASSWORD=your_secure_password_here
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Authentication
JWT_SECRET_KEY=jwt-secret-change-me
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_EXPIRATION_DAYS=7
```

*Note: Ensure you have created the `resumatch_db` in PostgreSQL.*

### C. Run Server
```bash
python manage.py migrate
python manage.py runserver
```
The backend will start at `http://localhost:8000`.

---

## 2. Frontend Setup

Open a **new** terminal (keep the backend running) and go to the project root:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.
