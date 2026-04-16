from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from apps.jobs.models import Job, JobApplication
from apps.matches.models import JobMatch
from apps.resumes.models import Resume

class JobMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=500)
    
    def find_matches_for_candidate(self, candidate):
        """Find matching jobs for a candidate considering all their resumes"""
        candidate_profile = candidate.candidate_profile
        all_resumes = list(Resume.objects.filter(user=candidate))
        
        if not all_resumes:
            return []
        
        # Get all applications to exclude them
        from apps.jobs.models import JobApplication
        applied_job_ids = set(JobApplication.objects.filter(candidate=candidate).values_list('job_id', flat=True))
        
        # Cleanup old matches for jobs already applied to
        JobMatch.objects.filter(candidate=candidate, job_id__in=applied_job_ids).delete()
        
        all_jobs = Job.objects.filter(is_active=True).exclude(id__in=applied_job_ids)
        matches = []
        
        for job in all_jobs:
            best_match_score = -1
            best_match_data = {}
            
            for resume in all_resumes:
                match_score = self.calculate_match_score(
                    candidate_profile,
                    resume,
                    job
                )
                
                if match_score > best_match_score:
                    best_match_score = match_score
                    best_match_data = {
                        'match_score': match_score,
                        'skill_match_percentage': self._calculate_skill_match(resume, job),
                        'experience_match_percentage': self._calculate_experience_match(candidate_profile, job),
                        'location_match': self._check_location_match(candidate_profile, job),
                        'salary_expectation_match': self._check_salary_match(candidate_profile, job),
                        'reasons': self._generate_match_reasons(candidate_profile, resume, job)
                    }
                    # Add which resume matched best if there are multiple
                    if len(all_resumes) > 1:
                        best_match_data['reasons'].insert(0, f"Best match with: {resume.title}")

            if best_match_score >= 5:
                # Use update_or_create to ensure we update existing matches
                job_match, _ = JobMatch.objects.update_or_create(
                    candidate=candidate,
                    job=job,
                    defaults=best_match_data
                )
                matches.append(job_match)
            else:
                # Remove match if it no longer meets threshold
                JobMatch.objects.filter(candidate=candidate, job=job).delete()
        
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
        """Calculate skill match percentage with robust matching"""
        import re
        
        # 1. Normalize and split job skills
        raw_job_skills = job.skills_required
        if not raw_job_skills:
            # Fallback to requirements if skills_required is empty
            raw_job_skills = [r for r in job.requirements if isinstance(r, str) and len(r) < 40]
        
        if not raw_job_skills:
            return 50 # Broad match if no skills specified
            
        # Refined splitting: handle "Java/Python", "React, Node", "HTML & CSS"
        job_skills_processed = set()
        for s in raw_job_skills:
            # Split by /, &, comma, and "and"
            parts = re.split(r'[/,&]|\band\b', s.lower())
            for p in parts:
                clean_p = p.strip()
                if clean_p:
                    job_skills_processed.add(clean_p)
        
        if not job_skills_processed:
            return 0
            
        # 2. Normalize resume skills
        resume_skills_lower = [s.lower() for s in resume.skills_identified]
        resume_text_lower = (resume.extracted_text or "").lower()
        
        # 3. Match calculation
        matched_count = 0
        for skill in job_skills_processed:
            # Check in identified skills (strict)
            if skill in resume_skills_lower:
                matched_count += 1
                continue
            
            # Check in text (flexible - handle partial matches or word boundaries)
            if re.search(rf'\b{re.escape(skill)}\b', resume_text_lower):
                matched_count += 1
                continue
                
            # One more try: if it's multiple words, check each? No, that might be too broad.
            # But let's try if the skill is found as a substring
            if len(skill) > 3 and skill in resume_text_lower:
                matched_count += 1
        
        match_percentage = (matched_count / len(job_skills_processed)) * 100
        
        # Base floor if the job title is found in the resume (highly relevant)
        if job.title.lower() in resume_text_lower:
            match_percentage = max(match_percentage, 10)
            
        # Cap and return
        return min(match_percentage, 100)
    
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
