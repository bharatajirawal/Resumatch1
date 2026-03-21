from django.db import models
from apps.users.models import RecruiterProfile, CustomUser

class Job(models.Model):
    EXPERIENCE_CHOICES = (
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior'),
        ('executive', 'Executive'),
    )
    
    recruiter = models.ForeignKey(RecruiterProfile, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=255)
    description = models.TextField()
    about_role = models.TextField(blank=True)
    responsibilities = models.JSONField(default=list, blank=True)
    nice_to_have = models.JSONField(default=list, blank=True)
    benefits = models.JSONField(default=list, blank=True)
    ai_generated_description = models.TextField(blank=True, help_text="AI-refined job description")
    requirements = models.JSONField(default=list)
    skills_required = models.JSONField(default=list)
    
    location = models.CharField(max_length=255)
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    salary_currency = models.CharField(max_length=10, default='INR')
    salary_type = models.CharField(max_length=50, blank=True) # CTC / In-hand
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES)
    
    employment_type = models.CharField(max_length=50, choices=[('full-time', 'Full-time'), ('part-time', 'Part-time'), ('contract', 'Contract'), ('remote', 'Remote')])
    category = models.CharField(max_length=100)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'jobs_job'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', '-created_at']),
            models.Index(fields=['experience_level']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return f"{self.title} at {self.recruiter.company_name}"


class JobApplication(models.Model):
    STATUS_CHOICES = (
        ('applied', 'Applied'),
        ('reviewed', 'Reviewed'),
        ('shortlisted', 'Shortlisted'),
        ('interview', 'Interview Scheduled'),
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted'),
    )
    
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='applications')
    resume = models.ForeignKey('resumes.Resume', on_delete=models.SET_NULL, null=True, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    match_score = models.FloatField(default=0.0)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'jobs_jobapplication'
        unique_together = ('job', 'candidate')
        ordering = ['-applied_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['candidate', '-applied_at']),
        ]
    
    def __str__(self):
        return f"{self.candidate.email} - {self.job.title}"
    
    def update_status(self, new_status, changed_by=None, note=''):
        """Update status and create history entry"""
        old_status = self.status
        self.status = new_status
        self.save()
        ApplicationStatusHistory.objects.create(
            application=self,
            old_status=old_status,
            new_status=new_status,
            changed_by=changed_by,
            note=note
        )


class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    note = models.TextField(blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'jobs_applicationstatushistory'
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.application} : {self.old_status} → {self.new_status}"


class InterviewSchedule(models.Model):
    INTERVIEW_TYPE_CHOICES = (
        ('phone', 'Phone Screen'),
        ('video', 'Video Call'),
        ('onsite', 'On-site'),
        ('technical', 'Technical Round'),
        ('hr', 'HR Round'),
    )
    
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
    )
    
    application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name='interviews')
    interviewer = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='conducted_interviews')
    interview_type = models.CharField(max_length=20, choices=INTERVIEW_TYPE_CHOICES, default='video')
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    location = models.CharField(max_length=500, blank=True, help_text="Physical address or video call link")
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    candidate_notified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'jobs_interviewschedule'
        ordering = ['scheduled_at']
    
    def __str__(self):
        return f"Interview: {self.application.candidate.email} for {self.application.job.title} on {self.scheduled_at}"

