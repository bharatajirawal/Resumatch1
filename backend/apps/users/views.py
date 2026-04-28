import random
import string
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser, OTPVerification, CandidateProfile, RecruiterProfile
from .serializers import UserRegistrationSerializer, UserDetailSerializer


class UserViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = UserDetailSerializer
    queryset = CustomUser.objects.all()
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                from django.db import IntegrityError, OperationalError
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                
                # Send OTP after registration
                try:
                    self._send_otp(user, user.email)
                except Exception as e:
                    print(f"Failed to send OTP: {e}")
                
                return Response({
                    'user': UserDetailSerializer(user).data,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'otp_sent': True,
                    'message': 'Account created. Please verify your email with the OTP sent.'
                }, status=status.HTTP_201_CREATED)
            except IntegrityError:
                return Response(
                    {'email': ['User with this email already exists.']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            except OperationalError as e:
                return Response(
                    {'error': 'Database connection failed. Please check your internet or database settings.'}, 
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(username=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserDetailSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def password_reset_request(self, request):
        """Request a password reset OTP"""
        try:
            email = request.data.get('email')
            if not email:
                return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = CustomUser.objects.filter(email=email).first()
            if user:
                self._send_otp(user, email, subject="ResuMatch - Password Reset OTP")
                
            return Response({'message': 'If an account exists with this email, an OTP has been sent.'})
        except Exception as e:
            print(f"Password reset request error: {e}")
            return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def password_reset_confirm(self, request):
        """Reset password using OTP"""
        try:
            email = request.data.get('email')
            otp_code = request.data.get('otp')
            new_password = request.data.get('new_password')
            
            if not all([email, otp_code, new_password]):
                return Response({'error': 'Email, OTP, and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
                
            user = CustomUser.objects.filter(email=email).first()
            if not user:
                return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
                
            otp = OTPVerification.objects.filter(
                user=user, 
                email=email, 
                otp_code=otp_code, 
                is_used=False
            ).order_by('-created_at').first()
            
            if not otp or otp.is_expired:
                return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
                
            user.set_password(new_password)
            user.save()
            
            otp.is_used = True
            otp.save()
            
            return Response({'message': 'Password reset successful. You can now login with your new password.'})
        except Exception as e:
            print(f"Password reset confirm error: {e}")
            return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['GET', 'PATCH'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        if request.method.upper() == 'GET':
            serializer = UserDetailSerializer(request.user)
            return Response(serializer.data)
        
        elif request.method.upper() == 'PATCH':
            serializer = UserDetailSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated])
    def dashboard(self, request):
        user = request.user
        
        # Try to get from cache first
        from django.core.cache import cache
        cache_key = f"user_dashboard_{user.id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
            
        data = {
            'user_type': user.user_type,
            'stats': {}
        }
        
        if user.user_type == 'candidate':
            from apps.resumes.models import Resume
            from apps.matches.models import JobMatch
            from apps.jobs.models import JobApplication
            
            primary_resume = Resume.objects.filter(user=user, is_primary=True).first()
            if not primary_resume:
                primary_resume = Resume.objects.filter(user=user).order_by('-created_at').first()
            
            applications = JobApplication.objects.filter(candidate=user)
            
            data['stats'] = {
                'resume_score': primary_resume.ai_score if primary_resume else 0,
                'job_matches': JobMatch.objects.filter(candidate=user).count(),
                'applications': applications.count(),
                'applications_pending': applications.filter(status='applied').count(),
                'applications_shortlisted': applications.filter(status='shortlisted').count(),
                'applications_accepted': applications.filter(status='accepted').count(),
                'applications_rejected': applications.filter(status='rejected').count(),
                'profile_views': 0,
                'has_resume': primary_resume is not None,
                'resume_id': primary_resume.id if primary_resume else None,
                'is_verified': user.is_verified,
            }
        
        elif user.user_type == 'recruiter':
            from apps.jobs.models import Job, JobApplication
            from django.db.models import Count, Avg
            
            recruiter_profile = RecruiterProfile.objects.filter(user=user).first()
            jobs = Job.objects.filter(recruiter=recruiter_profile)
            all_apps = JobApplication.objects.filter(job__in=jobs)
            
            data['stats'] = {
                'active_jobs': jobs.filter(is_active=True).count(),
                'total_applications': all_apps.count(),
                'new_candidates': all_apps.filter(status='applied').count(),
                'shortlisted': all_apps.filter(status='shortlisted').count(),
                'avg_match_score': round(all_apps.aggregate(avg=Avg('match_score'))['avg'] or 0, 1),
                'job_views': 0,
                'trust_score': recruiter_profile.trust_score_info if recruiter_profile else None
            }
        
        # Cache for 5 minutes
        cache.set(cache_key, data, 300)
        return Response(data)
    
    # ===== NEW: Google OAuth =====
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def google_auth(self, request):
        """Handle Google OAuth login/signup"""
        google_token = request.data.get('token')
        user_type = request.data.get('user_type', 'candidate')
        
        if not google_token:
            return Response({'error': 'Google token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify Google token
            import requests
            
            # First try as ID token (which is what GoogleLogin component returns)
            google_response = requests.get(f'https://oauth2.googleapis.com/tokeninfo?id_token={google_token}')
            
            if google_response.status_code != 200:
                # Fallback to Access token (for custom OAuth flows)
                google_response = requests.get(
                    f'https://www.googleapis.com/oauth2/v3/userinfo',
                    headers={'Authorization': f'Bearer {google_token}'}
                )
            
            if google_response.status_code != 200:
                return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)
            
            google_data = google_response.json()
            email = google_data.get('email')
            # Token info returns 'sub', userinfo returns 'sub'
            google_id = google_data.get('sub')
            first_name = google_data.get('given_name', '')
            last_name = google_data.get('family_name', '')
            
            # Check if user exists (by google_id or email)
            user = CustomUser.objects.filter(google_id=google_id).first()
            if not user:
                user = CustomUser.objects.filter(email=email).first()
                if user:
                    print(f"User matched by email: {email} (UID: {user.id})")
            else:
                print(f"User matched by google_id: {google_id} (UID: {user.id})")
            
            if user:
                # Existing user - merge/login
                if not user.google_id:
                    # Only link if the user_type matches or we are intentional
                    if user.user_type == user_type:
                        print(f"Linking google_id {google_id} to user {user.email}")
                        user.google_id = google_id
                        user.save()
                    else:
                        print(f"NOT linking google_id because requested user_type '{user_type}' doesn't match existing user_type '{user.user_type}'")
                        pass 
                
                if user.user_type != user_type:
                    print(f"Role mismatch detected: DB={user.user_type}, Requested={user_type}")
                
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': UserDetailSerializer(user).data,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'is_new': False,
                    'role_mismatch': user.user_type != user_type
                })
            else:
                # New user - create account
                print(f"Creating new {user_type} account for {email}")
                user = CustomUser.objects.create_user(
                    username=email,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    user_type=user_type,
                    google_id=google_id,
                    is_verified=True,  # Google-verified email
                )
                user.set_unusable_password()
                user.save()
                
                # Create profile
                if user_type == 'candidate':
                    CandidateProfile.objects.create(user=user)
                elif user_type == 'recruiter':
                    RecruiterProfile.objects.create(user=user, company_name=f"{first_name}'s Company")
                
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': UserDetailSerializer(user).data,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'is_new': True,
                    'is_profile_created': True
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            print(f"Google auth error: {e}")
            return Response({'error': f'Google authentication failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    
    # ===== NEW: Send OTP =====
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def send_otp(self, request):
        """Send OTP to user's email"""
        user = request.user
        
        # Check cooldown (60 seconds)
        recent_otp = OTPVerification.objects.filter(
            user=user,
            created_at__gte=timezone.now() - timezone.timedelta(seconds=60)
        ).first()
        
        if recent_otp:
            return Response({
                'error': 'Please wait 60 seconds before requesting a new OTP',
                'retry_after': 60
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        try:
            self._send_otp(user, user.email)
            return Response({'message': 'OTP sent to your email', 'email': user.email})
        except Exception as e:
            return Response({'error': f'Failed to send OTP: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # ===== NEW: Verify OTP =====
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def verify_otp(self, request):
        """Verify OTP code"""
        otp_code = request.data.get('otp')
        user = request.user
        
        if not otp_code:
            return Response({'error': 'OTP code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the latest active OTP for this user
        otp = OTPVerification.objects.filter(
            user=user,
            is_used=False
        ).order_by('-created_at').first()
        
        if not otp:
            return Response({'error': 'No active OTP found. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if otp.is_locked:
            return Response({'error': 'Too many attempts. Please request a new OTP.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        if otp.is_expired:
            return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check OTP
        otp.attempts += 1
        otp.save()
        
        if otp.otp_code == otp_code:
            otp.is_used = True
            otp.save()
            user.is_verified = True
            user.save()
            
            # Update recruiter profile if applicable
            if user.user_type == 'recruiter' and hasattr(user, 'recruiter_profile'):
                user.recruiter_profile.is_email_verified = True
                user.recruiter_profile.save()
            return Response({'message': 'Email verified successfully', 'is_verified': True})
        else:
            remaining = otp.max_attempts - otp.attempts
            return Response({
                'error': 'Invalid OTP',
                'attempts_remaining': remaining
            }, status=status.HTTP_400_BAD_REQUEST)

    # ===== NEW: Verification Endpoints =====
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def verify_linkedin(self, request):
        """Verify LinkedIn profile (mock)"""
        user = request.user
        if user.user_type != 'recruiter':
            return Response({'error': 'Only recruiters can verify LinkedIn'}, status=status.HTTP_400_BAD_REQUEST)
        
        linkedin_url = request.data.get('linkedin_url') or user.recruiter_profile.linkedin_url
        if not linkedin_url:
            return Response({'error': 'LinkedIn URL is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        profile = user.recruiter_profile
        profile.linkedin_url = linkedin_url
        profile.is_linkedin_verified = True 
        profile.save()
        
        return Response({
            'message': 'LinkedIn profile verified successfully', 
            'trust_score': profile.trust_score_info
        })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def verify_website(self, request):
        """Verify Company Website (mock)"""
        user = request.user
        if user.user_type != 'recruiter':
            return Response({'error': 'Only recruiters can verify website'}, status=status.HTTP_400_BAD_REQUEST)
            
        profile = user.recruiter_profile
        profile.is_website_verified = True
        profile.save()
        
        return Response({
            'message': 'Website verified successfully', 
            'trust_score': profile.trust_score_info
        })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def verify_proof(self, request):
        """Verify Company Proof (mock)"""
        user = request.user
        if user.user_type != 'recruiter':
            return Response({'error': 'Only recruiters can verify company proof'}, status=status.HTTP_400_BAD_REQUEST)
            
        profile = user.recruiter_profile
        profile.has_company_proof = True
        profile.save()
        
        return Response({
            'message': 'Company proof verified successfully', 
            'trust_score': profile.trust_score_info
        })
    
    def _send_otp(self, user, email, subject='ResuMatch - Email Verification OTP'):
        """Generate and send OTP"""
        otp_code = ''.join(random.choices(string.digits, k=6))
        
        OTPVerification.objects.create(
            user=user,
            email=email,
            otp_code=otp_code,
            expires_at=timezone.now() + timezone.timedelta(minutes=5)
        )
        
        # Send email
        try:
            send_mail(
                subject=subject,
                message=f'Your OTP code is: {otp_code}\n\nThis code expires in 5 minutes.\n\nDo not share this code with anyone.',
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@resumatch.com'),
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            # Log the OTP for development
            print(f"\n{'='*50}")
            print(f"DEBUG OTP for {email}: {otp_code}")
            print(f"Subject: {subject}")
            print(f"Email sending failed: {e}")
            print(f"{'='*50}\n")
