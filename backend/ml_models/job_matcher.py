from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from apps.jobs.models import Job, JobApplication
from apps.matches.models import JobMatch
from apps.resumes.models import Resume

class JobMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=500)
    
    def find_matches_for_candidate(self, candidate):
        """Find matching jobs for a candidate"""
        candidate_profile = candidate.candidate_profile
        candidate_resume = Resume.objects.filter(user=candidate, is_primary=True).first()
        if not candidate_resume:
            # Fallback to the most recent resume
            candidate_resume = Resume.objects.filter(user=candidate).order_by('-created_at').first()
        
        if not candidate_resume:
            return []
        
        all_jobs = Job.objects.filter(is_active=True)
        matches = []
        
        for job in all_jobs:
            # Check if already applied
            if JobApplication.objects.filter(job=job, candidate=candidate).exists():
                continue
            
            match_score = self.calculate_match_score(
                candidate_profile,
                candidate_resume,
                job
            )
            
            # Use update_or_create to ensure we update existing matches with new logic
            job_match, _ = JobMatch.objects.update_or_create(
                candidate=candidate,
                job=job,
                defaults={
                    'match_score': match_score,
                    'skill_match_percentage': self._calculate_skill_match(candidate_resume, job),
                    'experience_match_percentage': self._calculate_experience_match(candidate_profile, job),
                    'location_match': self._check_location_match(candidate_profile, job),
                    'salary_expectation_match': self._check_salary_match(candidate_profile, job),
                    'reasons': self._generate_match_reasons(candidate_profile, candidate_resume, job)
                }
            )
            if match_score >= 5: # Extremely low threshold to ensure visibility
                matches.append(job_match)
        
        return sorted(matches, key=lambda x: x.match_score, reverse=True)
    
    def calculate_match_score(self, candidate_profile, resume, job):
        """Calculate overall match score"""
        skill_match = self._calculate_skill_match(resume, job)
        exp_match = self._calculate_experience_match(candidate_profile, job)
        location_match = self._check_location_match(candidate_profile, job) * 20
        salary_match = self._check_salary_match(candidate_profile, job) * 10
        
        # Robust title matching
        title_bonus = 0
        job_title_lower = job.title.lower()
        resume_title_lower = resume.title.lower()
        headline_lower = candidate_profile.headline.lower()
        
        if job_title_lower in resume_title_lower or job_title_lower in headline_lower:
            title_bonus = 35
        else:
            # Check for word-level matches
            job_words = [w for w in job_title_lower.split() if len(w) > 2]
            if any(word in resume_title_lower for word in job_words) or any(word in headline_lower for word in job_words):
                title_bonus = 25
            elif any(word in job_title_lower for word in resume.extracted_text.lower().split()[:100]):
                title_bonus = 15

        # Base score to ensure something shows up if it's broadly relevant
        base_score = 10 if job.category.lower() in resume.extracted_text.lower() else 5

        # Weighted average
        score = (skill_match * 0.4) + (exp_match * 0.2) + location_match + salary_match + title_bonus + base_score
        return min(score, 100)
    
    def _calculate_skill_match(self, resume, job):
        """Calculate skill match percentage with fallbacks"""
        resume_skills = [s.lower() for s in resume.skills_identified]
        job_skills = [s.lower() for s in job.skills_required]
        
        # Fallback to requirements if job_skills is empty
        if not job_skills:
            job_skills = [r.lower() for r in job.requirements if isinstance(r, str) and len(r) < 40]
        
        if not job_skills:
            return 50 # Broad match if no skills specified
        
        matched = set(resume_skills).intersection(set(job_skills))
        
        # If no strict set match, try partial string matching
        if not matched:
            resume_text = resume.extracted_text.lower()
            matched_count = sum(1 for skill in job_skills if skill in resume_text)
            match_percentage = (matched_count / len(job_skills)) * 100
        else:
            match_percentage = (len(matched) / len(job_skills)) * 100
        
        return max(match_percentage, 10 if job.title.lower() in resume.extracted_text.lower() else 0)
    
    def _calculate_experience_match(self, candidate_profile, job):
        """Calculate experience level match"""
        candidate_exp = candidate_profile.experience_years
        job_exp_level = job.experience_level
        
        exp_mapping = {'entry': 0, 'mid': 5, 'senior': 10, 'executive': 15}
        required_years = exp_mapping.get(job_exp_level, 5)
        
        if candidate_exp >= required_years:
            return 100
        elif candidate_exp >= required_years * 0.7:
            return 80
        else:
            return (candidate_exp / required_years) * 100
    
    def _check_location_match(self, candidate_profile, job):
        """Check if location matches"""
        if not job.location or 'remote' in job.location.lower():
            return True
        
        if candidate_profile.location and candidate_profile.location.lower() in job.location.lower():
            return True
        
        return False
    
    def _check_salary_match(self, candidate_profile, job):
        """Check if salary expectations match"""
        if not job.salary_min or not job.salary_max:
            return True
        
        return True  # Assuming candidate accepts range
    
    def _generate_match_reasons(self, candidate_profile, resume, job):
        """Generate reasons for the match"""
        reasons = []
        
        matched_skills = set(resume.skills_identified).intersection(set(job.skills_required))
        if matched_skills:
            reasons.append(f"Skills match: {', '.join(list(matched_skills)[:3])}")
        
        if candidate_profile.experience_years >= 5:
            reasons.append(f"Experience: {candidate_profile.experience_years}+ years")
        
        if self._check_location_match(candidate_profile, job):
            reasons.append(f"Location compatible: {job.location}")
        
        return reasons if reasons else ["Good overall fit"]
