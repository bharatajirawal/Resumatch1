from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import JobMatch
from .serializers import JobMatchSerializer
from ml_models.job_matcher import JobMatcher

class JobMatchViewSet(viewsets.ModelViewSet):
    serializer_class = JobMatchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return JobMatch.objects.filter(candidate=self.request.user)
    
    @action(detail=False, methods=['post'])
    def find_matches(self, request):
        try:
            from apps.resumes.models import Resume
            
            candidate = request.user
            
            # Check if candidate has a resume
            has_resume = Resume.objects.filter(user=candidate).exists()
            if not has_resume:
                return Response({
                    'error': 'Please upload a resume before finding job matches.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            matcher = JobMatcher()
            matches = matcher.find_matches_for_candidate(candidate)
            
            if not matches:
                return Response({
                    'message': 'No matches found at this time. Try updating your resume or check back later.',
                    'matches': []
                }, status=status.HTTP_200_OK)
            
            serializer = self.get_serializer(matches, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def compare_resumes(self, request):
        job_id = request.query_params.get('job_id')
        if not job_id:
            return Response({'error': 'job_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from apps.jobs.models import Job
            from apps.resumes.models import Resume
            
            job = Job.objects.get(id=job_id)
            resumes = Resume.objects.filter(user=request.user)
            matcher = JobMatcher()
            
            results = []
            for resume in resumes:
                score = matcher.calculate_match_score(request.user.candidate_profile, resume, job)
                results.append({
                    'resume_id': resume.id,
                    'resume_title': resume.title,
                    'match_score': score,
                    'is_primary': resume.is_primary
                })
            
            return Response(results)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
