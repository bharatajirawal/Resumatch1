from django.db import models
from apps.users.models import CustomUser
from apps.jobs.models import Job

class JobMatch(models.Model):
    candidate = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='job_matches')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='candidate_matches')
    match_score = models.FloatField()
    skill_match_percentage = models.FloatField()
    experience_match_percentage = models.FloatField()
    location_match = models.BooleanField()
    salary_expectation_match = models.BooleanField()
    reasons = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'matches_jobmatch'
        unique_together = ('candidate', 'job')
        ordering = ['-match_score']
    
    def __str__(self):
        return f"{self.candidate.email} - {self.job.title} ({self.match_score}%)"
