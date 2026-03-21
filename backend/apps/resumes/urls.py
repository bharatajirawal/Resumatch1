from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ResumeViewSet, shared_resume_view

router = DefaultRouter()
router.register(r'', ResumeViewSet, basename='resume')

urlpatterns = [
    path('shared/<uuid:share_id>/', shared_resume_view, name='shared-resume'),
] + router.urls
