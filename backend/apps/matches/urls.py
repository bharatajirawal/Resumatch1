from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import JobMatchViewSet

router = DefaultRouter()
router.register(r'', JobMatchViewSet, basename='match')

urlpatterns = router.urls
