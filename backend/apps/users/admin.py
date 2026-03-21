from django.contrib import admin
from .models import CustomUser, RecruiterProfile, CandidateProfile

admin.site.register(CustomUser)
admin.site.register(RecruiterProfile)
admin.site.register(CandidateProfile)
