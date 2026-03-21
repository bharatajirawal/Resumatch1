"""
AI-powered API views for resume enhancement, ATS scoring, and summary generation.
These enhance the existing ML models rather than rewriting them.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.resumes.models import Resume, ResumeAnalysis
import json

try:
    import google.genai as genai
    from google.genai import types
except ImportError:
    genai = None
    types = None


def _get_gemini_client():
    """Get Gemini client if available"""
    from decouple import config
    gemini_key = config('GEMINI_API_KEY', default=None)
    if gemini_key and len(gemini_key) > 10 and genai:
        return genai.Client(api_key=gemini_key)
    return None


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ats_score(request):
    """Calculate ATS compatibility score with detailed suggestions"""
    resume_id = request.data.get('resume_id')
    job_description = request.data.get('job_description', '')
    
    if not resume_id:
        return Response({'error': 'resume_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        resume = Resume.objects.get(id=resume_id, user=request.user)
    except Resume.DoesNotExist:
        return Response({'error': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)
    
    text = resume.extracted_text
    if not text:
        return Response({'error': 'Resume has no extracted text'}, status=status.HTTP_400_BAD_REQUEST)
    
    client = _get_gemini_client()
    if client:
        try:
            prompt = f"""
            You are an ATS (Applicant Tracking System) scanner. Analyze this resume for ATS compatibility.
            
            Resume content:
            {text[:4000]}
            
            {"Target job description: " + job_description[:2000] if job_description else ""}
            
            Return a JSON response with:
            - ats_score (integer 0-100): Overall ATS compatibility score
            - format_score (integer 0-100): How well the format works with ATS
            - keyword_score (integer 0-100): Keyword optimization score
            - section_score (integer 0-100): Section structure score
            - suggestions (list of strings): Specific improvements for ATS compatibility
            - missing_keywords (list of strings): Important keywords that are missing
            - format_issues (list of strings): Formatting issues that might confuse ATS
            - strengths (list of strings): What's already ATS-friendly
            """
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type='application/json',
                ),
            )
            
            result = json.loads(response.text)
            
            # Update analysis record
            analysis, _ = ResumeAnalysis.objects.get_or_create(
                resume=resume,
                defaults={'analysis_text': text[:300]}
            )
            analysis.ats_score = result.get('ats_score', 0)
            analysis.ats_suggestions = result.get('suggestions', [])
            analysis.save()
            
            return Response(result)
        except Exception as e:
            print(f"Gemini ATS analysis failed: {e}")
    
    # Fallback: basic ATS scoring
    ats_result = _basic_ats_score(text, job_description)
    return Response(ats_result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enhance_bullets(request):
    """Enhance resume bullet points using AI"""
    bullets = request.data.get('bullets', [])
    context = request.data.get('context', '')  # job title or role
    
    if not bullets:
        return Response({'error': 'bullets list is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    client = _get_gemini_client()
    if client:
        try:
            prompt = f"""
            You are a professional resume writer. Enhance these resume bullet points to be more impactful.
            
            {"Context/Role: " + context if context else ""}
            
            Original bullets:
            {json.dumps(bullets)}
            
            For each bullet:
            1. Start with a strong action verb
            2. Quantify impact where possible
            3. Be specific and concise
            4. Optimize for ATS keywords
            
            Return a JSON with:
            - enhanced_bullets (list of objects with 'original', 'enhanced', 'improvement_notes')
            """
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type='application/json',
                ),
            )
            
            result = json.loads(response.text)
            return Response(result)
        except Exception as e:
            print(f"Gemini bullet enhancement failed: {e}")
    
    # Fallback
    enhanced = []
    for bullet in bullets:
        enhanced.append({
            'original': bullet,
            'enhanced': bullet,
            'improvement_notes': 'AI enhancement unavailable. Try adding metrics and action verbs.'
        })
    return Response({'enhanced_bullets': enhanced})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_summary(request):
    """Generate a professional summary from resume content"""
    resume_id = request.data.get('resume_id')
    target_role = request.data.get('target_role', '')
    
    if not resume_id:
        return Response({'error': 'resume_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        resume = Resume.objects.get(id=resume_id, user=request.user)
    except Resume.DoesNotExist:
        return Response({'error': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)
    
    text = resume.extracted_text
    if not text:
        return Response({'error': 'Resume has no extracted text'}, status=status.HTTP_400_BAD_REQUEST)
    
    client = _get_gemini_client()
    if client:
        try:
            prompt = f"""
            You are a professional resume writer. Generate a compelling professional summary
            based on this resume content.
            
            Resume content:
            {text[:4000]}
            
            {"Target role: " + target_role if target_role else ""}
            
            Return a JSON with:
            - summary (string): A 3-4 sentence professional summary
            - summary_short (string): A 1-2 sentence elevator pitch version
            - key_highlights (list of strings): 3-5 career highlights to emphasize
            - suggested_title (string): Recommended professional title
            """
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type='application/json',
                ),
            )
            
            result = json.loads(response.text)
            return Response(result)
        except Exception as e:
            print(f"Gemini summary generation failed: {e}")
    
    # Fallback
    skills = resume.skills_identified[:5]
    exp = resume.experience_level
    return Response({
        'summary': f"Experienced {exp}-level professional with skills in {', '.join(skills)}. Seeking opportunities to leverage expertise and drive impactful results.",
        'summary_short': f"A {exp}-level professional specializing in {', '.join(skills[:3])}.",
        'key_highlights': skills,
        'suggested_title': resume.job_titles[0] if resume.job_titles else 'Professional'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def job_resume_match(request):
    """Get detailed matching score between a resume and job description"""
    resume_id = request.data.get('resume_id')
    job_id = request.data.get('job_id')
    
    if not resume_id or not job_id:
        return Response({'error': 'resume_id and job_id are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        resume = Resume.objects.get(id=resume_id, user=request.user)
        from apps.jobs.models import Job
        job = Job.objects.get(id=job_id)
    except (Resume.DoesNotExist, Job.DoesNotExist):
        return Response({'error': 'Resume or Job not found'}, status=status.HTTP_404_NOT_FOUND)
    
    client = _get_gemini_client()
    if client:
        try:
            prompt = f"""
            Analyze the match between this resume and job description.
            
            Resume:
            Skills: {json.dumps(resume.skills_identified)}
            Experience: {resume.experience_level}
            Content: {resume.extracted_text[:3000]}
            
            Job:
            Title: {job.title}
            Description: {job.description[:2000]}
            Required Skills: {json.dumps(job.skills_required)}
            Experience Level: {job.experience_level}
            
            Return a JSON with:
            - overall_score (integer 0-100)
            - skill_match (integer 0-100)
            - experience_match (integer 0-100)
            - culture_fit (integer 0-100): estimated from writing style
            - matched_skills (list of strings)
            - missing_skills (list of strings)
            - recommendations (list of strings): how to improve the match
            - verdict (string): one of 'excellent_match', 'good_match', 'partial_match', 'weak_match'
            """
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type='application/json',
                ),
            )
            
            result = json.loads(response.text)
            return Response(result)
        except Exception as e:
            print(f"Gemini match analysis failed: {e}")
    
    # Fallback to existing matcher
    from ml_models.job_matcher import JobMatcher
    matcher = JobMatcher()
    score = matcher.calculate_match_score(request.user.candidate_profile, resume, job)
    
    matched_skills = list(set(s.lower() for s in resume.skills_identified) & set(s.lower() for s in job.skills_required))
    missing_skills = list(set(s.lower() for s in job.skills_required) - set(s.lower() for s in resume.skills_identified))
    
    return Response({
        'overall_score': round(score),
        'skill_match': round((len(matched_skills) / max(len(job.skills_required), 1)) * 100),
        'experience_match': 100 if resume.experience_level == job.experience_level else 60,
        'culture_fit': 70,
        'matched_skills': matched_skills,
        'missing_skills': missing_skills,
        'recommendations': [f'Consider adding {s} to your resume' for s in missing_skills[:3]],
        'verdict': 'excellent_match' if score > 80 else 'good_match' if score > 60 else 'partial_match' if score > 40 else 'weak_match'
    })


def _basic_ats_score(text, job_description=''):
    """Basic ATS scoring without AI"""
    text_lower = text.lower()
    score = 50  # Base
    suggestions = []
    
    # Check sections
    sections = ['experience', 'education', 'skills', 'summary', 'projects']
    found = sum(1 for s in sections if s in text_lower)
    section_score = min(found * 20, 100)
    
    if found < 4:
        suggestions.append(f'Add missing sections: {", ".join(s for s in sections if s not in text_lower)}')
    
    # Check formatting
    format_score = 70
    if text.count('•') > 3 or text.count('-') > 5:
        format_score += 15
    else:
        suggestions.append('Use bullet points for better ATS parsing')
    
    if '@' in text:
        format_score += 15
    else:
        suggestions.append('Include your email address')
    
    # Keyword density
    keyword_score = 60
    if job_description:
        job_words = set(job_description.lower().split())
        resume_words = set(text_lower.split())
        overlap = len(job_words & resume_words) / max(len(job_words), 1)
        keyword_score = min(int(overlap * 200), 100)
        
        missing = [w for w in job_words if w not in resume_words and len(w) > 4][:10]
        if missing:
            suggestions.append(f'Consider adding keywords: {", ".join(missing[:5])}')
    
    ats_score = int((section_score + format_score + keyword_score) / 3)
    
    return {
        'ats_score': ats_score,
        'format_score': format_score,
        'keyword_score': keyword_score,
        'section_score': section_score,
        'suggestions': suggestions if suggestions else ['Your resume has good ATS compatibility'],
        'missing_keywords': [],
        'format_issues': [],
        'strengths': ['Basic structure detected']
    }
