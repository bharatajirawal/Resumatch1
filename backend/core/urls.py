from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from ml_models.ai_views import ats_score, enhance_bullets, generate_summary, job_resume_match

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/users/', include('apps.users.urls')),
    path('api/resumes/', include('apps.resumes.urls')),
    path('api/jobs/', include('apps.jobs.urls')),
    path('api/matches/', include('apps.matches.urls')),
    
    # AI endpoints
    path('api/ai/ats-score/', ats_score, name='ai-ats-score'),
    path('api/ai/enhance-bullets/', enhance_bullets, name='ai-enhance-bullets'),
    path('api/ai/generate-summary/', generate_summary, name='ai-generate-summary'),
    path('api/ai/job-resume-match/', job_resume_match, name='ai-job-resume-match'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
