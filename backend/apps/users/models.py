import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import URLValidator
from django.utils import timezone

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('candidate', 'Candidate'),
        ('recruiter', 'Recruiter'),
        ('admin', 'Admin'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    phone_number = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(default=False)
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    
    class Meta:
        db_table = 'users_customuser'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.user_type})"


class RecruiterProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='recruiter_profile')
    company_name = models.CharField(max_length=255)
    company_website = models.URLField(blank=True, null=True)
    company_logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    linkedin_url = models.URLField(blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True)
    company_size = models.CharField(max_length=50, blank=True)
    
    # Verification Flags
    is_email_verified = models.BooleanField(default=False)
    is_linkedin_verified = models.BooleanField(default=False)
    is_website_verified = models.BooleanField(default=False)
    has_company_proof = models.BooleanField(default=False)
    past_hires = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def trust_score_info(self):
        score = 0
        domain_match = False
        
        # 1. Email Verification (+25)
        if self.is_email_verified or self.user.is_verified: 
            score += 25
        
        # 2. Domain/Website Match (+25)
        if self.company_website and (self.is_website_verified or self.user.email.split('@')[-1] in self.company_website):
             domain = self.company_website.split('//')[-1].split('/')[0].replace('www.', '')
             email_domain = self.user.email.split('@')[-1]
             if domain == email_domain and domain not in ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']:
                 score += 25
                 domain_match = True
             elif self.is_website_verified:
                 score += 25
                 
        # 3. LinkedIn Connected & Verified (+25)
        if self.linkedin_url:
            score += 15
            if self.is_linkedin_verified:
                score += 10
            
        # 4. Official Company Proof Uploaded (+25)
        if self.has_company_proof:
            score += 25
            
        # cap at 100
        score = min(100, score)
            
        badge = "Verified" if score >= 80 else ("Partially Verified" if score >= 40 else "Unverified")
        return {
            "score": score,
            "domain_match": domain_match,
            "badge": badge,
            "is_verified": score >= 80,
            "badge_color": "green" if score >= 80 else ("yellow" if score >= 40 else "red"),
            "verifications": {
                "email": self.is_email_verified or self.user.is_verified,
                "linkedin": self.is_linkedin_verified,
                "website": self.is_website_verified or domain_match,
                "proof": self.has_company_proof
            }
        }
    
    class Meta:
        db_table = 'users_recruiterprofile'
    
    def __str__(self):
        return f"{self.company_name} - {self.user.email}"


class CandidateProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='candidate_profile')
    headline = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    experience_years = models.IntegerField(default=0)
    skills = models.JSONField(default=list, help_text="List of skills")
    education = models.JSONField(default=list, help_text="List of education entries")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_candidateprofile'
    
    def __str__(self):
        return f"{self.user.get_full_name} - {self.headline}"


class OTPVerification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='otp_codes')
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=5)
    
    class Meta:
        db_table = 'users_otpverification'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP for {self.email} - {'Used' if self.is_used else 'Active'}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @property
    def is_locked(self):
        return self.attempts >= self.max_attempts
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=5)
        super().save(*args, **kwargs)
