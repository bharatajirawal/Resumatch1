import os
import django
import sys

# Setup Django
sys.path.append('c:/Users/BHARAT/Downloads/resu-match-ui-build/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import CustomUser, RecruiterProfile, CandidateProfile
from rest_framework.test import APIRequestFactory
from apps.users.views import UserViewSet
import json

def test_google_auth_roles():
    factory = APIRequestFactory()
    view = UserViewSet.as_view({'post': 'google_auth'})
    
    # 1. Mock Recruiter User already in DB (Manual Signup)
    email_r = "recruiter@test.com"
    user_r, _ = CustomUser.objects.get_or_create(
        username=email_r, 
        email=email_r,
        user_type='recruiter'
    )
    user_r.google_id = None
    user_r.save()
    print(f"Initial Recruiter: {user_r.email}, ID: {user_r.id}, GoogleID: {user_r.google_id}, Type: {user_r.user_type}")

    # 2. Simulate Google Login as "Candidate" for that same email
    # We mock the requests.get in the view actually... so we can't easily test without mocking requests.
    # But we can look at the logic.
    
    # Actually, let's just inspect the logic in a simulated way.
    google_id_c = "GOOGLE_ID_123"
    email_c = email_r # SAME EMAIL
    
    # Simulate the lookup logic in views.py
    print("\n--- Simulating Google Login with same email but user_type='candidate' ---")
    user = CustomUser.objects.filter(google_id=google_id_c).first()
    if not user:
        user = CustomUser.objects.filter(email=email_c).first()
    
    if user:
        print(f"Found existing user: {user.email}, Type: {user.user_type}")
        if not user.google_id:
            user.google_id = google_id_c
            user.save()
            print(f"Updated GoogleID for {user.email} to {user.google_id}")
        
        # NOTE: user.user_type is NOT updated!
        print(f"User Type remains: {user.user_type}")
    
    # 3. Simulate Google Login with DIFFERENT email
    email_b = "candidate@test.com"
    google_id_b = "GOOGLE_ID_456"
    print(f"\n--- Simulating Google Login with DIFFERENT email: {email_b} ---")
    user = CustomUser.objects.filter(google_id=google_id_b).first()
    if not user:
        user = CustomUser.objects.filter(email=email_b).first()
    
    if not user:
        print("Creating NEW user...")
        # Create profile...
        new_user = CustomUser.objects.create_user(
            username=email_b,
            email=email_b,
            user_type='candidate',
            google_id=google_id_b
        )
        print(f"Created new user: {new_user.email}, ID: {new_user.id}, Type: {new_user.user_type}")

    # Inspect all users
    print("\n--- All Users in DB ---")
    for u in CustomUser.objects.all():
        print(f"Email: {u.email}, GoogleID: {u.google_id}, Type: {u.user_type}")

if __name__ == "__main__":
    test_google_auth_roles()
