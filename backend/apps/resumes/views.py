from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.files.storage import default_storage
from django.utils import timezone
from .models import Resume, ResumeAnalysis, ResumeVersion, ResumeShareLink
from .serializers import (
    ResumeSerializer, ResumeUploadSerializer, ResumeVersionSerializer,
    ResumeShareLinkSerializer, ResumeAutoSaveSerializer, SharedResumeSerializer
)
from ml_models.resume_refiner import ResumeRefiner


class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).select_related('analysis').prefetch_related('versions', 'share_links')
    
    @action(detail=False, methods=['post'])
    def upload(self, request):
        serializer = ResumeUploadSerializer(data=request.data)
        if serializer.is_valid():
            is_primary = request.data.get('is_primary', 'false').lower() == 'true'
            
            # If this is the user's first resume, make it primary
            if not Resume.objects.filter(user=request.user).exists():
                is_primary = True
                
            if is_primary:
                Resume.objects.filter(user=request.user).update(is_primary=False)

            resume = serializer.save(user=request.user, is_primary=is_primary)
            
            # Extract text and analyze with AI
            try:
                refiner = ResumeRefiner()
                extracted_text = refiner.extract_text(resume.file)
                resume.extracted_text = extracted_text
                
                analysis = refiner.analyze_resume(extracted_text)
                resume.ai_score = analysis['score']
                resume.ai_feedback = analysis['feedback']
                resume.skills_identified = analysis['skills']
                resume.experience_level = analysis['experience_level']
                resume.job_titles = analysis['job_titles']
                resume.save()
                
                # Create analysis record
                ResumeAnalysis.objects.create(
                    resume=resume,
                    analysis_text=analysis['analysis'],
                    metrics=analysis.get('metrics', {}),
                    strengths=analysis['strengths'],
                    weaknesses=analysis['weaknesses'],
                    suggestions=analysis['suggestions'],
                    ats_score=analysis.get('ats_score', 0),
                    ats_suggestions=analysis.get('ats_suggestions', [])
                )
                
                # Create initial version
                ResumeVersion.objects.create(
                    resume=resume,
                    version_number=1,
                    title=resume.title,
                    file=resume.file,
                    extracted_text=extracted_text,
                    ai_score=resume.ai_score,
                    ai_feedback=resume.ai_feedback,
                    skills_identified=resume.skills_identified,
                    change_note='Initial upload'
                )
                
                # Trigger match calculation
                from ml_models.job_matcher import JobMatcher
                matcher = JobMatcher()
                matcher.find_matches_for_candidate(request.user)

            except Exception as e:
                # Still return the resume even if analysis fails
                print(f"Analysis or matching failed: {e}")
            
            return Response(ResumeSerializer(resume).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def primary(self, request):
        resume = Resume.objects.filter(user=request.user, is_primary=True).select_related('analysis').first()
        if not resume:
            # Fallback to most recent
            resume = Resume.objects.filter(user=request.user).select_related('analysis').order_by('-created_at').first()
            
        if resume:
            return Response(ResumeSerializer(resume).data)
        return Response({'detail': 'No resume found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def reanalyze(self, request, pk=None):
        resume = self.get_object()
        try:
            refiner = ResumeRefiner()
            extracted_text = resume.extracted_text
            if not extracted_text:
                extracted_text = refiner.extract_text(resume.file)
                resume.extracted_text = extracted_text
            
            analysis = refiner.analyze_resume(extracted_text)
            
            # Update resume fields
            resume.ai_score = analysis['score']
            resume.ai_feedback = analysis['feedback']
            resume.skills_identified = analysis['skills']
            resume.experience_level = analysis['experience_level']
            resume.job_titles = analysis['job_titles']
            resume.save()
            
            # Update or create analysis record
            ResumeAnalysis.objects.update_or_create(
                resume=resume,
                defaults={
                    'analysis_text': analysis['analysis'],
                    'metrics': analysis.get('metrics', {}),
                    'strengths': analysis['strengths'],
                    'weaknesses': analysis['weaknesses'],
                    'suggestions': analysis['suggestions'],
                    'ats_score': analysis.get('ats_score', 0),
                    'ats_suggestions': analysis.get('ats_suggestions', [])
                }
            )
            return Response(ResumeSerializer(resume).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        resume = self.get_object()
        Resume.objects.filter(user=request.user).update(is_primary=False)
        resume.is_primary = True
        resume.save()
        return Response({'status': 'Primary resume updated'})
    
    # ===== NEW: Resume Version History =====
    @action(detail=True, methods=['get', 'post'])
    def versions(self, request, pk=None):
        resume = self.get_object()
        
        if request.method == 'GET':
            versions = resume.versions.all()
            serializer = ResumeVersionSerializer(versions, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Create a new version snapshot
            latest_version = resume.versions.order_by('-version_number').first()
            new_version_number = (latest_version.version_number + 1) if latest_version else 1
            
            version = ResumeVersion.objects.create(
                resume=resume,
                version_number=new_version_number,
                title=resume.title,
                file=resume.file,
                extracted_text=resume.extracted_text,
                ai_score=resume.ai_score,
                ai_feedback=resume.ai_feedback,
                skills_identified=resume.skills_identified,
                change_note=request.data.get('change_note', '')
            )
            
            resume.version = new_version_number
            resume.save()
            
            return Response(ResumeVersionSerializer(version).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], url_path='versions/compare')
    def compare_versions(self, request, pk=None):
        """Compare two versions of a resume"""
        resume = self.get_object()
        v1 = request.query_params.get('v1')
        v2 = request.query_params.get('v2')
        
        if not v1 or not v2:
            return Response({'error': 'Please provide v1 and v2 query parameters'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            version1 = resume.versions.get(version_number=v1)
            version2 = resume.versions.get(version_number=v2)
            
            comparison = {
                'version_1': ResumeVersionSerializer(version1).data,
                'version_2': ResumeVersionSerializer(version2).data,
                'score_diff': version2.ai_score - version1.ai_score,
                'skills_added': list(set(version2.skills_identified) - set(version1.skills_identified)),
                'skills_removed': list(set(version1.skills_identified) - set(version2.skills_identified)),
            }
            return Response(comparison)
        except ResumeVersion.DoesNotExist:
            return Response({'error': 'Version not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # ===== NEW: Resume Sharing =====
    @action(detail=True, methods=['get', 'post'])
    def share(self, request, pk=None):
        resume = self.get_object()
        
        if request.method == 'GET':
            links = resume.share_links.filter(is_active=True)
            serializer = ResumeShareLinkSerializer(links, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            is_public = request.data.get('is_public', True)
            expires_hours = request.data.get('expires_hours', None)
            
            expires_at = None
            if expires_hours:
                expires_at = timezone.now() + timezone.timedelta(hours=int(expires_hours))
            
            link = ResumeShareLink.objects.create(
                resume=resume,
                is_public=is_public,
                expires_at=expires_at
            )
            return Response(ResumeShareLinkSerializer(link).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], url_path='share/(?P<share_id>[^/.]+)')
    def revoke_share(self, request, pk=None, share_id=None):
        """Revoke a share link"""
        resume = self.get_object()
        try:
            link = resume.share_links.get(share_id=share_id)
            link.is_active = False
            link.save()
            return Response({'status': 'Share link revoked'})
        except ResumeShareLink.DoesNotExist:
            return Response({'error': 'Share link not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # ===== NEW: Auto-Save Draft =====
    @action(detail=True, methods=['post'])
    def auto_save(self, request, pk=None):
        """Auto-save resume draft (debounced from frontend)"""
        resume = self.get_object()
        serializer = ResumeAutoSaveSerializer(resume, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(is_draft=True, last_auto_saved=timezone.now())
            return Response({'status': 'Draft saved', 'saved_at': timezone.now().isoformat()})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ===== NEW: Public shared resume view =====
@api_view(['GET'])
@permission_classes([AllowAny])
def shared_resume_view(request, share_id):
    """Public endpoint to view a shared resume"""
    try:
        link = ResumeShareLink.objects.select_related('resume', 'resume__analysis', 'resume__user').get(
            share_id=share_id, is_active=True
        )
        
        if link.is_expired:
            return Response({'error': 'This share link has expired'}, status=status.HTTP_410_GONE)
        
        if not link.is_public:
            return Response({'error': 'This resume is private'}, status=status.HTTP_403_FORBIDDEN)
        
        # Increment view count
        link.view_count += 1
        link.save(update_fields=['view_count'])
        
        serializer = SharedResumeSerializer(link.resume)
        return Response(serializer.data)
    except ResumeShareLink.DoesNotExist:
        return Response({'error': 'Share link not found'}, status=status.HTTP_404_NOT_FOUND)
