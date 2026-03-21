from rest_framework import serializers
from .models import Job, JobApplication, ApplicationStatusHistory, InterviewSchedule


class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ApplicationStatusHistory
        fields = ['id', 'old_status', 'new_status', 'changed_by_name', 'note', 'changed_at']
    
    def get_changed_by_name(self, obj):
        return obj.changed_by.get_full_name() if obj.changed_by else 'System'


class InterviewScheduleSerializer(serializers.ModelSerializer):
    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    
    class Meta:
        model = InterviewSchedule
        fields = ['id', 'application', 'interviewer', 'interview_type', 'scheduled_at', 'duration_minutes', 'location', 'notes', 'status', 'candidate_notified', 'candidate_name', 'candidate_email', 'job_title', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_candidate_name(self, obj):
        return obj.application.candidate.get_full_name()
    
    def get_candidate_email(self, obj):
        return obj.application.candidate.email
    
    def get_job_title(self, obj):
        return obj.application.job.title


class JobApplicationSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.get_full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    resume_id = serializers.SerializerMethodField()
    resume_file = serializers.SerializerMethodField()
    status_history = ApplicationStatusHistorySerializer(many=True, read_only=True)
    interviews = InterviewScheduleSerializer(many=True, read_only=True)
    resume_skills = serializers.SerializerMethodField()
    resume_experience = serializers.SerializerMethodField()
    resume_score = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplication
        fields = ['id', 'candidate', 'candidate_name', 'candidate_email', 'resume_id', 'resume_file', 'status', 'match_score', 'applied_at', 'status_history', 'interviews', 'resume_skills', 'resume_experience', 'resume_score']

    def get_resume_id(self, obj):
        return obj.resume.id if obj.resume else None

    def get_resume_file(self, obj):
        return obj.resume.file.url if obj.resume and obj.resume.file else None
    
    def get_resume_skills(self, obj):
        return obj.resume.skills_identified if obj.resume else []
    
    def get_resume_experience(self, obj):
        return obj.resume.experience_level if obj.resume else ''
    
    def get_resume_score(self, obj):
        return obj.resume.ai_score if obj.resume else 0


class JobSerializer(serializers.ModelSerializer):
    applications = JobApplicationSerializer(many=True, read_only=True)
    company_name = serializers.CharField(source='recruiter.company_name', read_only=True)
    application_count = serializers.IntegerField(source='applications.count', read_only=True)
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'about_role', 'responsibilities', 'nice_to_have', 'benefits', 'ai_generated_description', 'requirements', 'skills_required', 'location', 'salary_min', 'salary_max', 'salary_currency', 'salary_type', 'experience_level', 'employment_type', 'category', 'company_name', 'is_active', 'applications', 'application_count', 'created_at']
        read_only_fields = ['ai_generated_description', 'applications', 'application_count']


class JobListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views - no nested applications"""
    company_name = serializers.CharField(source='recruiter.company_name', read_only=True)
    application_count = serializers.IntegerField(source='applications.count', read_only=True)
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'location', 'salary_min', 'salary_max', 'experience_level', 'employment_type', 'category', 'company_name', 'is_active', 'application_count', 'created_at']


class JobCreateUpdateSerializer(serializers.ModelSerializer):
    description = serializers.CharField()
    
    class Meta:
        model = Job
        fields = ['title', 'description', 'about_role', 'responsibilities', 'nice_to_have', 'benefits', 'requirements', 'skills_required', 'location', 'salary_min', 'salary_max', 'salary_currency', 'salary_type', 'experience_level', 'employment_type', 'category']


class BulkActionSerializer(serializers.Serializer):
    application_ids = serializers.ListField(child=serializers.IntegerField())
    action = serializers.ChoiceField(choices=['accept', 'reject', 'shortlist', 'review'])
    note = serializers.CharField(required=False, default='')
