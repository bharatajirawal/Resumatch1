from django.urls import path
from rest_framework.routers import SimpleRouter
from .views import UserViewSet

router = SimpleRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('profile/', UserViewSet.as_view({'get': 'profile', 'patch': 'profile'}), name='user-profile'),
] + router.urls
