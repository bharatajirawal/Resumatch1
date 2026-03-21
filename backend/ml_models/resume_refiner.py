import PyPDF2
import spacy
from transformers import pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
import json
try:
    import google.genai as genai
    from google.genai import types
except ImportError:
    genai = None
    types = None


class ResumeRefiner:
    def __init__(self):
        self.nlp = None
        self.summarizer = None
        self.ner_pipeline = None
        
        # Load spaCy (essential for basic processing)
        try:
            self.nlp = spacy.load('en_core_web_sm')
        except Exception as e:
            print(f"Warning: Failed to load spaCy model: {e}")

    def _get_summarizer(self):
        if self.summarizer is None:
            try:
                self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
            except Exception as e:
                print(f"Warning: Failed to load summarizer model: {e}")
                return None
        return self.summarizer

    def _get_ner(self):
        if self.ner_pipeline is None:
            try:
                self.ner_pipeline = pipeline("ner", model="dslim/bert-base-uncased-finetuned-ner")
            except Exception as e:
                print(f"Warning: Failed to load NER model: {e}")
                return None
        return self.ner_pipeline
    
    def extract_text(self, file):
        """Extract text from PDF or DOCX file"""
        text = ""
        try:
            if file.name.endswith('.pdf'):
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text
            elif file.name.endswith(('.doc', '.docx')):
                from docx import Document
                doc = Document(file)
                for para in doc.paragraphs:
                    text += para.text + "\n"
        except Exception as e:
            print(f"Error extracting text: {e}")
        return text
    
    def analyze_resume(self, text):
        """Analyze resume using Gemini (Primary) or OpenAI if available, with heuristic fallbacks"""
        from decouple import config
        gemini_key = config('GEMINI_API_KEY', default=None)
        openai_key = config('OPENAI_API_KEY', default=None)
        
        # Try Gemini first as requested by user
        if gemini_key and len(gemini_key) > 10 and genai:
            try:
                print("Attempting Gemini analysis...")
                client = genai.Client(api_key=gemini_key)
                
                prompt = f"""
                You are an expert ATS (Applicant Tracking System) and Senior Tech Recruiter.
                Analyze the provided resume text with high precision.
                Provide a JSON response with:
                - score (integer 0-100)
                - feedback (object with 'overall', 'skills', 'experience' fields)
                - skills (list of strings)
                - experience_level (string: 'entry', 'mid', 'senior', or 'executive')
                - job_titles (list of strings)
                - summary (string)
                - strengths (list of strings)
                - weaknesses (list of strings)
                - suggestions (list of strings)
                - metrics (list of objects with 'label', 'value', 'max', 'status')
                
                Resume content:
                {text[:5000]}
                """
                
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type='application/json',
                    ),
                )
                
                result = json.loads(response.text)
                
                return {
                    'score': result.get('score', 75),
                    'feedback': result.get('feedback', {}),
                    'skills': result.get('skills', self._extract_skills(None, text)),
                    'experience_level': result.get('experience_level', 'mid'),
                    'job_titles': result.get('job_titles', []),
                    'analysis': result.get('summary', text[:300]),
                    'metrics': result.get('metrics', self._calculate_metrics(text, [], None)),
                    'strengths': result.get('strengths', []),
                    'weaknesses': result.get('weaknesses', []),
                    'suggestions': result.get('suggestions', [])
                }
            except Exception as e:
                print(f"Gemini analysis failed: {e}")

        # Fallback to OpenAI if Gemini fails or is not available
        if openai_key and len(openai_key) > 20:

            try:
                import openai
                client = openai.OpenAI(api_key=openai_key)
                
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "You are an expert ATS (Applicant Tracking System) and Senior Tech Recruiter. Analyze the provided resume text with high precision. Provide a JSON response with: score (0-100), feedback (object with 'overall', 'skills', 'experience' fields), skills (list), experience_level (string), job_titles (list), summary (string), strengths (list), weaknesses (list), suggestions (list), and metrics (list of objects with 'label', 'value', 'max', 'status')."},
                        {"role": "user", "content": f"Analyze this resume content:\n\n{text}"}
                    ],
                    response_format={ "type": "json_object" }
                )
                
                result = json.loads(response.choices[0].message.content)
                # Ensure structure matches our expectations
                return {
                    'score': result.get('score', 75),
                    'feedback': result.get('feedback', {}),
                    'skills': result.get('skills', self._extract_skills(None, text)),
                    'experience_level': result.get('experience_level', 'mid'),
                    'job_titles': result.get('job_titles', []),
                    'analysis': result.get('summary', text[:300]),
                    'metrics': result.get('metrics', self._calculate_metrics(text, [], None)),
                    'strengths': result.get('strengths', []),
                    'weaknesses': result.get('weaknesses', []),
                    'suggestions': result.get('suggestions', [])
                }
            except Exception as e:
                print(f"OpenAI analysis failed: {e}")
                # Fallback to Hugging Face if enabled
                hf_key = config('HUGGINGFACE_API_KEY', default=None)
                if hf_key and len(hf_key) > 10:
                    try:
                        print("Attempting Hugging Face analysis fallback...")
                        import requests
                        API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
                        headers = {"Authorization": f"Bearer {hf_key}"}
                        
                        prompt = f"Analysis this resume and return a JSON with score, feedback (overall, skills, experience), skills, experience_level, job_titles, summary, strengths, weaknesses, suggestions, metrics (list of objects with label, value, max, status):\n\n{text[:2000]}"
                        
                        # Note: Mistral might not be as good at direct JSON, so we handle it gracefully
                        response = requests.post(API_URL, headers=headers, json={
                            "inputs": f"<s>[INST] {prompt} [/INST]",
                            "parameters": {"max_new_tokens": 1000, "return_full_text": False}
                        }, timeout=30)
                        
                        if response.status_code == 200:
                            hf_text = response.json()[0]['generated_text']
                            # Attempt to find JSON in the response
                            import re
                            json_match = re.search(r'\{.*\}', hf_text, re.DOTALL)
                            if json_match:
                                result = json.loads(json_match.group())
                                return {
                                    'score': result.get('score', 70),
                                    'feedback': result.get('feedback', {}),
                                    'skills': result.get('skills', self._extract_skills(None, text)),
                                    'experience_level': result.get('experience_level', 'mid'),
                                    'job_titles': result.get('job_titles', []),
                                    'analysis': result.get('summary', text[:300]),
                                    'metrics': result.get('metrics', self._calculate_metrics(text, [], None)),
                                    'strengths': result.get('strengths', []),
                                    'weaknesses': result.get('weaknesses', []),
                                    'suggestions': result.get('suggestions', [])
                                }
                    except Exception as hf_e:
                        print(f"Hugging Face fallback also failed: {hf_e}")
                # Fallback to local analysis below
        
        # Local heuristic analysis (Improved)
        if self.nlp:
            doc = self.nlp(text)
        else:
            doc = None
        
        skills = self._extract_skills(doc, text)
        job_titles = self._extract_job_titles(text)
        experience_level = self._calculate_experience_level(text)
        analysis_text = self._generate_summary(text)
        score = self._calculate_score(text, skills, len(job_titles))
        feedback = self._generate_feedback(score, skills, experience_level)
        suggestions = self._generate_suggestions(text, skills)
        metrics = self._calculate_metrics(text, skills, doc)
        
        return {
            'score': score,
            'feedback': feedback,
            'skills': skills,
            'experience_level': experience_level,
            'job_titles': job_titles,
            'analysis': analysis_text,
            'metrics': metrics,
            'strengths': self._identify_strengths(text),
            'weaknesses': self._identify_weaknesses(text),
            'suggestions': suggestions
        }

    def _generate_summary(self, text):
        """Generate a summary, prioritizing local BART model, fallback to truncation"""
        summarizer = self._get_summarizer()
        if summarizer and len(text) > 100:
            try:
                # Truncate text if too long for the model
                input_text = text[:1024]
                summary = summarizer(input_text, max_length=130, min_length=30, do_sample=False)
                return summary[0]['summary_text']
            except Exception as e:
                print(f"Summarization error: {e}")
        
        # Fallback
        return text[:300] + "..." if len(text) > 300 else text

    def _extract_skills(self, doc, text):
        """Extract technical skills from resume"""
        skills = set()
        common_skills = [
            'python', 'java', 'javascript', 'react', 'django', 'flask', 'sql', 'mongodb',
            'aws', 'docker', 'kubernetes', 'git', 'machine learning', 'data science',
            'nodejs', 'typescript', 'vue', 'angular', 'html', 'css', 'sass',
            'postgresql', 'mysql', 'redis', 'elasticsearch', 'tensorflow', 'pytorch',
            'c++', 'c#', 'php', 'ruby', 'go', 'swift', 'kotlin', 'flutter',
            'aws', 'azure', 'gcp', 'terraform', 'jenkins', 'ansible', 'graphql', 'rest api',
            'microservices', 'serverless', 'agile', 'scrum', 'backend', 'frontend', 'full stack',
            'devops', 'testing', 'cypress', 'jest', 'spring boot', 'express', 'linux',
            'data analysis', 'pandas', 'numpy', 'scikit-learn', 'deep learning', 'nlp',
            'spark', 'hadoop', 'tableau', 'power bi', 'excel', 'security', 'penetration testing',
            'react native', 'ionic', 'unity', 'unreal engine', 'blockchain', 'solidity'
        ]
        
        text_lower = text.lower()
        for skill in common_skills:
            if skill in text_lower:
                skills.add(skill)
        
        return list(skills)
    
    def _extract_job_titles(self, text):
        """Extract job titles from resume"""
        common_titles = [
            'Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer',
            'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Machine Learning Engineer',
            'Data Engineer', 'Cloud Architect', 'QA Engineer', 'Business Analyst',
            'Web Developer', 'Mobile Developer', 'Systems Administrator'
        ]
        
        found_titles = []
        for title in common_titles:
            if title.lower() in text.lower():
                found_titles.append(title)
        
        return found_titles
    
    def _calculate_experience_level(self, text):
        """Estimate experience level based on resume content"""
        text_lower = text.lower()
        
        if any(exp in text_lower for exp in ['junior', 'entry', 'fresher', 'intern', '0-1 years']):
            return 'entry'
        elif any(exp in text_lower for exp in ['mid', 'intermediate', '2-5 years', 'senior', 'lead', 'principal']):
            if any(exp in text_lower for exp in ['senior', 'lead', '10+ years', 'principal']):
                return 'senior'
            return 'mid'
        else:
            return 'mid'
    
    def _calculate_score(self, text, skills, job_count):
        """Calculate overall score as the weighted average of all metrics"""
        # Calculate the metrics first
        metrics = self._calculate_metrics(text, skills, None)
        
        # Take weighted average of the 4 metrics
        total_weight = 0
        weighted_sum = 0
        
        for metric in metrics:
            weight = 1  # Equal weight for now
            weighted_sum += metric['value'] * weight
            total_weight += weight
        
        overall_score = round(weighted_sum / total_weight) if total_weight > 0 else 0
        return min(max(overall_score, 0), 100)

    def _calculate_metrics(self, text, skills, doc):
        """Calculate detailed breakdown metrics based on actual resume content"""
        text_lower = text.lower()
        word_count = len(text.split())
        
        # 1. Keyword Optimization (based on skill density and technical terms)
        skill_score = 0
        if len(skills) >= 15:
            skill_score = 100
        elif len(skills) >= 10:
            skill_score = 85
        elif len(skills) >= 5:
            skill_score = 70
        elif len(skills) >= 3:
            skill_score = 50
        else:
            skill_score = 30
        
        # 2. Format Clarity (based on structure and sections)
        sections = ['experience', 'education', 'skills', 'projects', 'summary']
        found_sections = sum(1 for s in sections if s in text_lower)
        
        format_score = 0
        if found_sections >= 5:
            format_score = 100
        elif found_sections >= 4:
            format_score = 80
        elif found_sections >= 3:
            format_score = 60
        else:
            format_score = 40
        
        # 3. Experience Details (based on content richness)
        exp_score = 40  # Base
        if word_count > 600:
            exp_score += 40
        elif word_count > 400:
            exp_score += 25
        elif word_count > 200:
            exp_score += 15
        
        if any(year in text for year in ['2020', '2021', '2022', '2023', '2024', '2025']):
            exp_score += 10
        if 'year' in text_lower or 'month' in text_lower:
            exp_score += 10
        
        exp_score = min(exp_score, 100)
        
        # 4. Achievement Metrics (quantifiable impact)
        ach_score = 20  # Base
        
        # Check for numbers and percentages
        has_percentage = '%' in text or 'percent' in text_lower
        has_numbers = any(char.isdigit() for char in text)
        
        if has_percentage:
            ach_score += 30
        if has_numbers:
            ach_score += 20
        
        # Check for impact words
        impact_words = ['increased', 'improved', 'reduced', 'managed', 'led', 'achieved', 'delivered']
        impact_count = sum(1 for word in impact_words if word in text_lower)
        ach_score += min(impact_count * 5, 30)
        
        ach_score = min(ach_score, 100)
        
        return [
            { "label": "Keyword Optimization", "value": skill_score, "max": 100, "status": "good" if skill_score > 70 else "warning" },
            { "label": "Format Clarity", "value": format_score, "max": 100, "status": "good" if format_score > 70 else "warning" },
            { "label": "Experience Details", "value": exp_score, "max": 100, "status": "good" if exp_score > 70 else "warning" },
            { "label": "Achievement Metrics", "value": ach_score, "max": 100, "status": "good" if ach_score > 70 else "warning" },
        ]
    
    def _generate_feedback(self, score, skills, experience_level):
        """Generate feedback based on analysis"""
        feedback = {}
        
        if score >= 80:
            feedback['overall'] = "Excellent resume with strong content"
        elif score >= 60:
            feedback['overall'] = "Good resume, room for improvement"
        else:
            feedback['overall'] = "Resume needs significant improvement"
        
        feedback['skills'] = f"Found {len(skills)} relevant skills"
        feedback['experience'] = f"Identified as {experience_level} level professional"
        
        return feedback
    
    def _identify_strengths(self, text):
        """Identify resume strengths"""
        strengths = []
        text_lower = text.lower()
        
        if 'achievement' in text_lower or 'accomplished' in text_lower or 'successfully' in text_lower:
            strengths.append('Includes achievement metrics')
        
        if 'project' in text_lower:
            strengths.append('Mentions specific projects')
        
        if 'award' in text_lower or 'certification' in text_lower or 'certified' in text_lower:
            strengths.append('Includes certifications/awards')
        
        return strengths if strengths else ['Basic professional information present']
    
    def _identify_weaknesses(self, text):
        """Perform detailed audit with stricter criteria to surface real weaknesses"""
        weaknesses = []
        text_lower = text.lower()
        word_count = len(text.split())
        
        # 1. Impact Metrics - Be very strict
        has_percentage = '%' in text or 'percent' in text_lower
        has_dollar = '$' in text or 'dollar' in text_lower
        
        if not has_percentage and not has_dollar:
            weaknesses.append('Missing quantifiable impact metrics (%, $, numbers)')
        
        # 2. Action Language - Check for strong verbs
        strong_verbs = ['led', 'managed', 'developed', 'created', 'built', 'architected', 'designed', 'implemented']
        found_verbs = [v for v in strong_verbs if v in text_lower]
        
        if len(found_verbs) < 3:
            weaknesses.append(f'Weak action language: Only {len(found_verbs)} strong verbs found (need 3+)')
            
        # 3. Essential Sections - Very strict
        if 'education' not in text_lower and 'degree' not in text_lower:
            weaknesses.append('Missing Education section')
        
        if 'experience' not in text_lower and 'work' not in text_lower:
            weaknesses.append('Missing Experience/Work section')
            
        if '@' not in text and 'email' not in text_lower:
            weaknesses.append('Missing contact email')
            
        # 4. Professional presence
        if 'linkedin' not in text_lower and 'github' not in text_lower:
            weaknesses.append('No professional profile links (LinkedIn, GitHub)')
            
        # 5. Buzzword Overuse
        buzzwords = ['synergy', 'passionate', 'detail-oriented', 'team player', 'motivated', 'hardworking']
        found_buzz = [b for b in buzzwords if b in text_lower]
        if len(found_buzz) >= 2:
            weaknesses.append(f'Generic buzzwords detected: {", ".join(found_buzz)}')
            
        # 6. Content volume
        if word_count < 300:
            weaknesses.append(f'Resume too brief ({word_count} words - aim for 400+)')
        elif word_count > 1000:
            weaknesses.append(f'Resume too long ({word_count} words - aim for 400-800)')
            
        # 7. Specificity check
        if text.count('responsible for') > 2:
            weaknesses.append('Overuse of passive phrase "responsible for" - use action verbs instead')
            
        return weaknesses if weaknesses else ['No critical structural weaknesses found']
    
    def _generate_suggestions(self, text, skills):
        """Generate specific actionable improvements"""
        suggestions = []
        text_lower = text.lower()
        
        if 'linkedin.com' not in text_lower:
            suggestions.append("Add your LinkedIn profile URL to increase professional visibility.")
        
        if 'github.com' not in text_lower and any(tech in text_lower for tech in ['python', 'javascript', 'react', 'java']):
            suggestions.append("Since you have technical skills, include a GitHub link to showcase your code.")
            
        if len(skills) < 8:
            suggestions.append("Expand your skills section. Your profile appears technically 'thin' compared to industry benchmarks.")
            
        if not any(char.isdigit() for char in text):
            suggestions.append("Convert your achievements into numbers. Instead of 'Managed a team', use 'Managed a team of 12 developers'.")
            
        if len(text.split()) > 1000:
            suggestions.append("Your resume is quite long. Consider condensing it to 1-2 pages for better readability by recruiters.")

        return suggestions if suggestions else ["Consider adding industry certifications to further differentiate your profile."]
