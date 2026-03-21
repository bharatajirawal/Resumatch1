from rest_framework import serializers
from .models import Resume, ResumeAnalysis, ResumeVersion, ResumeShareLink


class ResumeAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeAnalysis
        fields = ['analysis_text', 'metrics', 'strengths', 'weaknesses', 'suggestions', 'ats_score', 'ats_suggestions', 'analyzed_at']


class ResumeVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeVersion
        fields = ['id', 'version_number', 'title', 'file', 'extracted_text', 'ai_score', 'ai_feedback', 'skills_identified', 'change_note', 'created_at']
        read_only_fields = ['id', 'version_number', 'created_at']


class ResumeShareLinkSerializer(serializers.ModelSerializer):
    share_url = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = ResumeShareLink
        fields = ['id', 'share_id', 'is_public', 'is_active', 'expires_at', 'view_count', 'share_url', 'is_expired', 'created_at']
        read_only_fields = ['id', 'share_id', 'view_count', 'created_at']


class ResumeSerializer(serializers.ModelSerializer):
    analysis = ResumeAnalysisSerializer(read_only=True)
    versions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Resume
        fields = ['id', 'title', 'file', 'file_type', 'ai_score', 'ai_feedback', 'skills_identified', 'experience_level', 'job_titles', 'is_primary', 'version', 'is_draft', 'last_auto_saved', 'analysis', 'versions_count', 'created_at', 'updated_at']
        read_only_fields = ['ai_score', 'ai_feedback', 'skills_identified', 'experience_level', 'job_titles', 'version']
    
    def get_versions_count(self, obj):
        return obj.versions.count()


class ResumeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['title', 'file', 'file_type']
        extra_kwargs = {'file_type': {'required': False}}

    def validate(self, attrs):
        if 'file' in attrs:
            name = attrs['file'].name
            ext = name.split('.')[-1].lower()
            if ext not in ['pdf', 'doc', 'docx']:
                raise serializers.ValidationError({"file": f"Unsupported file extension: {ext}. Allowed: pdf, doc, docx"})
            attrs['file_type'] = ext
        return attrs


class ResumeAutoSaveSerializer(serializers.ModelSerializer):
    """Serializer for auto-save drafts"""
    class Meta:
        model = Resume
        fields = ['title', 'extracted_text']


class SharedResumeSerializer(serializers.ModelSerializer):
    """Public view serializer - limited fields for shared resumes"""
    analysis = ResumeAnalysisSerializer(read_only=True)
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Resume
        fields = ['title', 'ai_score', 'skills_identified', 'experience_level', 'job_titles', 'analysis', 'user_name', 'created_at']
    
    def get_user_name(self, obj):
        return obj.user.get_full_name()
