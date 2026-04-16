import sys
print("=== SCRIPT STARTED ===", flush=True)

import os
import django

# Setup Django environment
print("Configuring Django...", flush=True)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
print("Django setup complete.", flush=True)

from apps.users.models import CustomUser, RecruiterProfile, CandidateProfile, OTPVerification
from apps.resumes.models import Resume, ResumeAnalysis, ResumeVersion, ResumeShareLink
from apps.jobs.models import Job, JobApplication, ApplicationStatusHistory, InterviewSchedule
from apps.matches.models import JobMatch

def wipe_all_data():
    print("--- SUPABASE DATA WIPE INITIATED ---", flush=True)
    try:
        # Check connection
        user_count = CustomUser.objects.count()
        print(f"Connected to Supabase. Total users in DB: {user_count}", flush=True)

        # Order matters due to Foreign Key constraints
        print("1. Deleting Job Matches...", flush=True)
        JobMatch.objects.all().delete()

        print("2. Deleting Interviews and Status History...", flush=True)
        InterviewSchedule.objects.all().delete()
        ApplicationStatusHistory.objects.all().delete()
        
        print("3. Deleting Job Applications...", flush=True)
        JobApplication.objects.all().delete()

        print("4. Deleting Jobs...", flush=True)
        Job.objects.all().delete()

        print("5. Deleting Resume Analysis/Versions/Sharing...", flush=True)
        ResumeShareLink.objects.all().delete()
        ResumeVersion.objects.all().delete()
        ResumeAnalysis.objects.all().delete()

        print("6. Deleting Resumes...", flush=True)
        Resume.objects.all().delete()

        print("7. Clearing Profiles (Keeping User Accounts)...", flush=True)
        RecruiterProfile.objects.all().delete()
        CandidateProfile.objects.all().delete()
        OTPVerification.objects.all().delete()

        print("\nSUCCESS: All application data has been cleared from Supabase.", flush=True)
        
    except Exception as e:
        print(f"\nERROR: Could not complete wipe. Details: {str(e)}", flush=True)

if __name__ == "__main__":
    wipe_all_data()
