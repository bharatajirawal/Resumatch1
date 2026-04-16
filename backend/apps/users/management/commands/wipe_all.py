from django.core.management.base import BaseCommand
from apps.users.models import CustomUser, RecruiterProfile, CandidateProfile, OTPVerification
from apps.resumes.models import Resume, ResumeAnalysis, ResumeVersion, ResumeShareLink
from apps.jobs.models import Job, JobApplication, ApplicationStatusHistory, InterviewSchedule
from apps.matches.models import JobMatch

class Command(BaseCommand):
    help = 'Wipes all application data from Supabase but keeps user accounts'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('--- SUPABASE DATA WIPE INITIATED ---'))
        
        try:
            # Check connection
            user_count = CustomUser.objects.count()
            self.stdout.write(f"Connected to Supabase. Total users: {user_count}")

            # Order matters due to Foreign Key constraints
            self.stdout.write("1. Deleting Job Matches...")
            JobMatch.objects.all().delete()

            self.stdout.write("2. Deleting Interviews and Status History...")
            InterviewSchedule.objects.all().delete()
            ApplicationStatusHistory.objects.all().delete()
            
            self.stdout.write("3. Deleting Job Applications...")
            JobApplication.objects.all().delete()

            self.stdout.write("4. Deleting Jobs...")
            Job.objects.all().delete()

            self.stdout.write("5. Deleting Resume Analysis/Versions/Sharing...")
            ResumeShareLink.objects.all().delete()
            ResumeVersion.objects.all().delete()
            ResumeAnalysis.objects.all().delete()

            self.stdout.write("6. Deleting Resumes...")
            Resume.objects.all().delete()

            self.stdout.write("7. Clearing Profiles (Keeping User Accounts)...")
            RecruiterProfile.objects.all().delete()
            CandidateProfile.objects.all().delete()
            OTPVerification.objects.all().delete()

            self.stdout.write(self.style.SUCCESS('\nSUCCESS: All application data has been cleared from Supabase.'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\nERROR: {str(e)}'))
