from rest_framework import serializers
from .models import CustomUser, RecruiterProfile, CandidateProfile

class CandidateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = ['headline', 'location', 'experience_years', 'skills', 'education']


class RecruiterProfileSerializer(serializers.ModelSerializer):
    trust_score = serializers.JSONField(source='trust_score_info', read_only=True)
    
    class Meta:
        model = RecruiterProfile
        fields = ['company_name', 'company_website', 'company_logo', 'linkedin_url', 'industry', 'company_size', 'is_email_verified', 'has_company_proof', 'past_hires', 'trust_score']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    candidate_profile = CandidateProfileSerializer(required=False)
    recruiter_profile = RecruiterProfileSerializer(required=False)
    
    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'user_type', 'password', 'password_confirm', 'candidate_profile', 'recruiter_profile']
    
    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data
    
    def create(self, validated_data):
        candidate_data = validated_data.pop('candidate_profile', None)
        recruiter_data = validated_data.pop('recruiter_profile', None)
        
        user = CustomUser.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            user_type=validated_data['user_type'],
            password=validated_data['password']
        )
        
        if validated_data['user_type'] == 'candidate':
            CandidateProfile.objects.create(user=user, **(candidate_data or {}))
        
        if validated_data['user_type'] == 'recruiter':
            RecruiterProfile.objects.create(user=user, **(recruiter_data or {}))
        
        return user


from apps.resumes.serializers import ResumeSerializer

class UserDetailSerializer(serializers.ModelSerializer):
    candidate_profile = CandidateProfileSerializer(required=False)
    recruiter_profile = RecruiterProfileSerializer(required=False)
    resumes = ResumeSerializer(many=True, read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'user_type', 'phone_number', 'profile_picture', 'bio', 'candidate_profile', 'recruiter_profile', 'resumes', 'created_at']
        read_only_fields = ['id', 'email', 'user_type', 'created_at']

    def update(self, instance, validated_data):
        candidate_data = validated_data.pop('candidate_profile', None)
        recruiter_data = validated_data.pop('recruiter_profile', None)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update candidate profile if it exists
        if candidate_data and hasattr(instance, 'candidate_profile'):
            candidate_profile = instance.candidate_profile
            for attr, value in candidate_data.items():
                setattr(candidate_profile, attr, value)
            candidate_profile.save()

        # Update recruiter profile if it exists
        if recruiter_data and hasattr(instance, 'recruiter_profile'):
            recruiter_profile = instance.recruiter_profile
            for attr, value in recruiter_data.items():
                setattr(recruiter_profile, attr, value)
            recruiter_profile.save()

        return instance
