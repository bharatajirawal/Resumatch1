from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Prefetch
from .models import Job, JobApplication, ApplicationStatusHistory, InterviewSchedule
from .serializers import (
    JobSerializer, JobListSerializer, JobCreateUpdateSerializer, 
    JobApplicationSerializer, ApplicationStatusHistorySerializer,
    InterviewScheduleSerializer, BulkActionSerializer
)
from ml_models.job_description_generator import JobDescriptionGenerator
from apps.users.models import RecruiterProfile


class JobViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['experience_level', 'employment_type', 'category']
    search_fields = ['title', 'location', 'skills_required']
    ordering_fields = ['created_at', 'salary_min']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return JobListSerializer
        return JobSerializer
    
    def get_queryset(self):
        qs = Job.objects.filter(is_active=True).select_related('recruiter')
        if self.action == 'retrieve':
            qs = qs.prefetch_related(
                Prefetch('applications', queryset=JobApplication.objects.select_related('candidate', 'resume'))
            )
        return qs
    
    def create(self, request, *args, **kwargs):
        try:
            recruiter_profile = getattr(request.user, 'recruiter_profile', None)
            if not recruiter_profile:
                from apps.users.models import RecruiterProfile
                recruiter_profile = RecruiterProfile.objects.filter(user=request.user).first()
                
                if not recruiter_profile:
                    if request.user.user_type == 'recruiter' or request.user.is_staff:
                        recruiter_profile = RecruiterProfile.objects.create(
                            user=request.user, 
                            company_name="My Company"
                        )
                    else:
                        return Response(
                            {"detail": "Only recruiters can post jobs. Your account type is not authorized."}, 
                            status=status.HTTP_403_FORBIDDEN
                        )

            serializer = JobCreateUpdateSerializer(data=request.data)
            if serializer.is_valid():
                job = serializer.save(recruiter=recruiter_profile)
                
                # Generate AI description
                try:
                    generator = JobDescriptionGenerator()
                    ai_description = generator.generate(
                        title=job.title,
                        description=job.description,
                        requirements=job.requirements,
                        skills=job.skills_required
                    )
                    job.ai_generated_description = ai_description
                    job.save()
                except Exception as e:
                    print(f"Error generating AI description: {e}")
                
                return Response(JobSerializer(job).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"SEVERE ERROR in Job creation: {str(e)}")
            return Response({"detail": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def my_jobs(self, request):
        try:
            recruiter_profile = RecruiterProfile.objects.get(user=request.user)
            jobs = Job.objects.filter(recruiter=recruiter_profile).select_related('recruiter').prefetch_related(
                Prefetch('applications', queryset=JobApplication.objects.select_related('candidate', 'resume'))
            )
            serializer = JobSerializer(jobs, many=True)
            return Response(serializer.data)
        except RecruiterProfile.DoesNotExist:
            return Response([])
    
    @action(detail=True, methods=['get'])
    def candidates(self, request, pk=None):
        """Get candidates for a specific job with filtering"""
        job = self.get_object()
        applications = job.applications.select_related('candidate', 'resume').prefetch_related('status_history', 'interviews')
        
        # === Advanced filtering ===
        skills_filter = request.query_params.get('skills')
        experience_filter = request.query_params.get('experience')
        education_filter = request.query_params.get('education')
        status_filter = request.query_params.get('status')
        min_score = request.query_params.get('min_score')
        
        if status_filter:
            applications = applications.filter(status=status_filter)
        
        if min_score:
            applications = applications.filter(match_score__gte=float(min_score))
        
        if skills_filter:
            skill_list = [s.strip().lower() for s in skills_filter.split(',')]
            for skill in skill_list:
                applications = applications.filter(resume__skills_identified__icontains=skill)
        
        if experience_filter:
            applications = applications.filter(resume__experience_level=experience_filter)
        
        serializer = JobApplicationSerializer(applications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        job = self.get_object()
        candidate = request.user
        resume_id = request.data.get('resume_id')
        
        # Check if already applied
        if JobApplication.objects.filter(job=job, candidate=candidate).exists():
            return Response({'detail': 'You have already applied for this job.'}, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.resumes.models import Resume
        if resume_id:
            resume = Resume.objects.filter(id=resume_id, user=candidate).first()
        else:
            resume = Resume.objects.filter(user=candidate, is_primary=True).first()
            if not resume:
                resume = Resume.objects.filter(user=candidate).order_by('-created_at').first()

        if not resume:
            return Response({'detail': 'Please upload a resume before applying.'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate match score for this specific resume
        from ml_models.job_matcher import JobMatcher
        matcher = JobMatcher()
        match_score = matcher.calculate_match_score(candidate.candidate_profile, resume, job)
        
        application = JobApplication.objects.create(
            job=job,
            candidate=candidate,
            resume=resume,
            match_score=match_score
        )
        
        # Create initial status history
        ApplicationStatusHistory.objects.create(
            application=application,
            old_status='',
            new_status='applied',
            changed_by=candidate,
            note='Application submitted'
        )
        
        return Response(JobApplicationSerializer(application).data, status=status.HTTP_201_CREATED)
    
    # ===== NEW: Update application status =====
    @action(detail=True, methods=['post'], url_path='applications/(?P<app_id>[^/.]+)/status')
    def update_application_status(self, request, pk=None, app_id=None):
        """Update the status of a specific application"""
        job = self.get_object()
        try:
            application = job.applications.get(id=app_id)
            new_status = request.data.get('status')
            note = request.data.get('note', '')
            
            valid_statuses = dict(JobApplication.STATUS_CHOICES).keys()
            if new_status not in valid_statuses:
                return Response({'error': f'Invalid status. Must be one of: {list(valid_statuses)}'}, status=status.HTTP_400_BAD_REQUEST)
            
            application.update_status(new_status, changed_by=request.user, note=note)
            return Response(JobApplicationSerializer(application).data)
        except JobApplication.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # ===== NEW: Application status history =====
    @action(detail=True, methods=['get'], url_path='applications/(?P<app_id>[^/.]+)/status-history')
    def application_status_history(self, request, pk=None, app_id=None):
        """Get the status history timeline for an application"""
        job = self.get_object()
        try:
            application = job.applications.get(id=app_id)
            history = application.status_history.all()
            serializer = ApplicationStatusHistorySerializer(history, many=True)
            return Response(serializer.data)
        except JobApplication.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # ===== NEW: Bulk actions =====
    @action(detail=False, methods=['post'], url_path='bulk-action')
    def bulk_action(self, request):
        """Bulk accept/reject/shortlist multiple applications"""
        serializer = BulkActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        app_ids = serializer.validated_data['application_ids']
        action_type = serializer.validated_data['action']
        note = serializer.validated_data.get('note', '')
        
        status_map = {
            'accept': 'accepted',
            'reject': 'rejected',
            'shortlist': 'shortlisted',
            'review': 'reviewed',
        }
        
        new_status = status_map[action_type]
        updated = 0
        
        # Ensure recruiter owns these applications
        try:
            recruiter_profile = RecruiterProfile.objects.get(user=request.user)
            applications = JobApplication.objects.filter(
                id__in=app_ids,
                job__recruiter=recruiter_profile
            )
            
            for app in applications:
                app.update_status(new_status, changed_by=request.user, note=note)
                updated += 1
            
            return Response({'updated': updated, 'status': new_status})
        except RecruiterProfile.DoesNotExist:
            return Response({'error': 'Recruiter profile not found'}, status=status.HTTP_403_FORBIDDEN)
    
    # ===== NEW: Schedule interview =====
    @action(detail=True, methods=['post'], url_path='applications/(?P<app_id>[^/.]+)/schedule-interview')
    def schedule_interview(self, request, pk=None, app_id=None):
        """Schedule an interview for an application"""
        job = self.get_object()
        try:
            application = job.applications.get(id=app_id)
            
            serializer = InterviewScheduleSerializer(data={
                **request.data,
                'application': application.id,
                'interviewer': request.user.id,
            })
            
            if serializer.is_valid():
                interview = serializer.save()
                
                # Update application status
                application.update_status('interview', changed_by=request.user, note=f'Interview scheduled for {interview.scheduled_at}')
                
                return Response(InterviewScheduleSerializer(interview).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except JobApplication.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # ===== NEW: Get all candidate applications with status for a candidate =====
    @action(detail=False, methods=['get'], url_path='my-applications')
    def my_applications(self, request):
        """Get all applications for the current candidate with status history"""
        applications = JobApplication.objects.filter(
            candidate=request.user
        ).select_related('job', 'job__recruiter', 'resume').prefetch_related('status_history', 'interviews').order_by('-applied_at')
        
        data = []
        for app in applications:
            data.append({
                'id': app.id,
                'job_title': app.job.title,
                'company_name': app.job.recruiter.company_name,
                'status': app.status,
                'match_score': app.match_score,
                'applied_at': app.applied_at,
                'status_history': ApplicationStatusHistorySerializer(app.status_history.all(), many=True).data,
                'interviews': InterviewScheduleSerializer(app.interviews.all(), many=True).data,
            })
        
        return Response(data)
    
    @action(detail=False, methods=['post'], url_path='generate-ai-jd')
    def generate_ai_jd(self, request):
        """Action to generate a structured job description using AI"""
        data = request.data
        try:
            generator = JobDescriptionGenerator()
            # If recruiter context is needed for prompt
            company_name = "My Company"
            try:
                recruiter_profile = RecruiterProfile.objects.get(user=request.user)
                company_name = recruiter_profile.company_name
            except:
                pass

            generated_data = generator.generate_structured_jd(
                title=data.get('title', ''),
                company=company_name,
                experience=data.get('experience_level', ''),
                skills=data.get('skills', []),
                location=data.get('location', ''),
                job_type=data.get('employment_type', '')
            )
            return Response(generated_data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
