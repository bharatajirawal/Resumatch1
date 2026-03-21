from rest_framework import serializers
from .models import JobMatch

class JobMatchSerializer(serializers.ModelSerializer):
    job_details = serializers.SerializerMethodField()
    match_highlights = serializers.SerializerMethodField()
    updated_at = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = JobMatch
        fields = ['id', 'job_details', 'match_highlights', 'match_score', 'updated_at']

    def get_job_details(self, obj):
        return {
            'id': obj.job.id,
            'title': obj.job.title,
            'company_name': obj.job.recruiter.company_name,
            'location': obj.job.location,
            'salary_range': f"{obj.job.salary_min} - {obj.job.salary_max}" if obj.job.salary_min and obj.job.salary_max else (obj.job.salary_min or "Competitive")
        }

    def get_match_highlights(self, obj):
        return obj.reasons[:3] if obj.reasons else []
