from django.db import models
from django.utils import timezone
import uuid
from apps.users.models import CustomUser

class Resume(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='resumes/')
    file_type = models.CharField(max_length=10, choices=[('pdf', 'PDF'), ('doc', 'DOC'), ('docx', 'DOCX')])
    extracted_text = models.TextField(blank=True)
    
    # AI Analysis Fields
    ai_score = models.FloatField(default=0.0, help_text="Resume quality score (0-100)")
    ai_feedback = models.JSONField(default=dict, help_text="AI generated feedback")
    skills_identified = models.JSONField(default=list, help_text="Skills extracted by AI")
    experience_level = models.CharField(max_length=50, blank=True)
    job_titles = models.JSONField(default=list, help_text="Job titles found in resume")
    
    is_primary = models.BooleanField(default=False)
    version = models.IntegerField(default=1)
    is_draft = models.BooleanField(default=False)
    last_auto_saved = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resumes_resume'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"


class ResumeAnalysis(models.Model):
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name='analysis')
    analysis_text = models.TextField()
    metrics = models.JSONField(default=dict, help_text="Detailed scoring metrics")
    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    suggestions = models.JSONField(default=list)
    ats_score = models.FloatField(default=0.0, help_text="ATS compatibility score")
    ats_suggestions = models.JSONField(default=list, help_text="ATS-specific improvement tips")
    analyzed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'resumes_resumeanalysis'
    
    def __str__(self):
        return f"Analysis for {self.resume.title}"


class ResumeVersion(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='resume_versions/')
    extracted_text = models.TextField(blank=True)
    ai_score = models.FloatField(default=0.0)
    ai_feedback = models.JSONField(default=dict)
    skills_identified = models.JSONField(default=list)
    change_note = models.TextField(blank=True, help_text="What changed in this version")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'resumes_resumeversion'
        ordering = ['-version_number']
        unique_together = ('resume', 'version_number')
    
    def __str__(self):
        return f"{self.resume.title} v{self.version_number}"


class ResumeShareLink(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='share_links')
    share_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_public = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    view_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'resumes_resumesharelink'
    
    def __str__(self):
        return f"Share link for {self.resume.title}"
    
    @property
    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    @property
    def share_url(self):
        return f"/resume/shared/{self.share_id}"

