# ResuMatch API Documentation

## Base URL
\`\`\`
http://localhost:8000/api
\`\`\`

## Authentication
All endpoints (except auth) require JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

## Endpoints

### Authentication

#### Register
\`\`\`
POST /users/register/
\`\`\`
Request:
\`\`\`json
{
  "email": "candidate@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "securepassword123",
  "password_confirm": "securepassword123",
  "user_type": "candidate",
  "candidate_profile": {
    "headline": "Full Stack Developer",
    "location": "San Francisco, CA",
    "experience_years": 5,
    "skills": ["Python", "React", "Django"],
    "education": [{"school": "MIT", "degree": "BS Computer Science"}]
  }
}
\`\`\`

#### Login
\`\`\`
POST /users/login/
\`\`\`
Request:
\`\`\`json
{
  "email": "candidate@example.com",
  "password": "securepassword123"
}
\`\`\`

Response:
\`\`\`json
{
  "user": {...},
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
\`\`\`

#### Get Profile
\`\`\`
GET /users/profile/
\`\`\`

### Resumes

#### Upload Resume
\`\`\`
POST /resumes/upload/
\`\`\`
Request (multipart/form-data):
\`\`\`
- title: "My Resume"
- file: <PDF/DOC/DOCX file>
- file_type: "pdf"
\`\`\`

Response:
\`\`\`json
{
  "id": 1,
  "title": "My Resume",
  "ai_score": 78.5,
  "skills_identified": ["Python", "Django", "React"],
  "experience_level": "mid",
  "is_primary": false
}
\`\`\`

#### List Resumes
\`\`\`
GET /resumes/
\`\`\`

#### Get Primary Resume
\`\`\`
GET /resumes/primary/
\`\`\`

#### Set Primary Resume
\`\`\`
POST /resumes/{id}/set_primary/
\`\`\`

### Jobs

#### List Jobs
\`\`\`
GET /jobs/?experience_level=mid&employment_type=full-time&location=Remote
\`\`\`

#### Search Jobs
\`\`\`
GET /jobs/?search=Software Engineer
\`\`\`

#### Get Job Details
\`\`\`
GET /jobs/{id}/
\`\`\`

#### Create Job (Recruiter only)
\`\`\`
POST /jobs/
\`\`\`
Request:
\`\`\`json
{
  "title": "Senior Python Developer",
  "description": "Looking for a senior developer with 5+ years experience",
  "requirements": ["5+ years Python", "Django experience", "Team lead skills"],
  "skills_required": ["Python", "Django", "PostgreSQL"],
  "location": "Remote",
  "salary_min": 120000,
  "salary_max": 160000,
  "experience_level": "senior",
  "employment_type": "full-time",
  "category": "Engineering"
}
\`\`\`

#### My Jobs (Recruiter only)
\`\`\`
GET /jobs/my_jobs/
\`\`\`

#### Job Candidates (Recruiter only)
\`\`\`
GET /jobs/{id}/candidates/
\`\`\`

### Job Matches

#### Find Matches for Candidate
\`\`\`
POST /matches/find_matches/
\`\`\`

#### Get My Matches
\`\`\`
GET /matches/
\`\`\`

#### Match Details
\`\`\`
GET /matches/{id}/
\`\`\`
Response:
\`\`\`json
{
  "id": 1,
  "job_title": "Senior Python Developer",
  "company_name": "Tech Corp",
  "match_score": 85.5,
  "skill_match_percentage": 90,
  "experience_match_percentage": 80,
  "location_match": true,
  "salary_expectation_match": true,
  "reasons": ["Skills match: Python, Django", "Experience: 6+ years"]
}
\`\`\`

## Error Responses

### 400 Bad Request
\`\`\`json
{
  "field_name": ["Error message"]
}
\`\`\`

### 401 Unauthorized
\`\`\`json
{
  "detail": "Authentication credentials were not provided."
}
\`\`\`

### 404 Not Found
\`\`\`json
{
  "detail": "Not found."
}
\`\`\`

## Rate Limiting
- Default: 1000 requests per hour per user

## Pagination
All list endpoints support pagination:
\`\`\`
GET /jobs/?page=2&page_size=20
\`\`\`

## Filtering Examples

### Filter Jobs by Experience Level
\`\`\`
GET /jobs/?experience_level=senior
\`\`\`

### Filter Jobs by Employment Type
\`\`\`
GET /jobs/?employment_type=remote
\`\`\`

### Search with Multiple Filters
\`\`\`
GET /jobs/?search=Python&experience_level=mid&location=Remote
