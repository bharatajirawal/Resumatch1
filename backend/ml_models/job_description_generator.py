from transformers import pipeline
import requests
from django.conf import settings

class JobDescriptionGenerator:
    def __init__(self):
        self.openai_api_key = settings.OPENAI_API_KEY
    
    def generate_structured_jd(self, title, company, experience, skills, location, job_type):
        """Generates a structured Job Description returning exactly 5 categories"""
        from google import genai
        from google.genai import types
        import json
        
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        skills_list = skills if isinstance(skills, list) else []
        prompt = f"""
        Generate a professional ATS-friendly job description based on:
        Job Title: {title}
        Company: {company}
        Experience: {experience}
        Skills: {', '.join(skills_list)}
        Location: {location}
        Job Type: {job_type}

        Return ONLY a strict JSON object with this exact schema (no markdown formatting around it):
        {{
            "about_role": "2-3 engaging paragraphs about the position",
            "responsibilities": ["point 1", "point 2", "point 3"],
            "requirements": ["point 1", "point 2", "point 3"],
            "nice_to_have": ["point 1", "point 2"],
            "benefits": ["benefit 1", "benefit 2"]
        }}
        """
        
        try:
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.7,
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"AI Generation Failed: {e}")
            return {
                "about_role": f"We are looking for a {title} with experience in {skills}.",
                "responsibilities": ["Design and develop software", "Collaborate with cross-functional teams"],
                "requirements": [f"{experience} experience preferred", "Strong problem-solving skills"],
                "nice_to_have": ["Previous industry experience"],
                "benefits": ["Competitive salary", "Remote-friendly environment"]
            }

    def generate(self, title, description, requirements, skills):
        """Existing generate method for backward compatibility"""
        try:
            prompt = self._build_prompt(title, description, requirements, skills)
            return self._call_openai_api(prompt)
        except Exception as e:
            return self._fallback_generation(title, description, requirements)
    
    def _build_prompt(self, title, description, requirements, skills):
        """Build prompt for AI model"""
        return f"""
        Enhance the following job description to make it more attractive to candidates while being clear and professional:
        
        Job Title: {title}
        Current Description: {description}
        Requirements: {', '.join(requirements)}
        Required Skills: {', '.join(skills)}
        
        Please provide:
        1. An enhanced job description (2-3 paragraphs)
        2. Key responsibilities (3-5 points)
        3. What we're looking for (3-5 points)
        4. Why join us (2-3 points)
        
        Make it engaging, clear, and specific.
        """
    
    def _call_openai_api(self, prompt):
        """Call Gemini (Primary) or OpenAI API for generation"""
        from decouple import config
        gemini_key = config('GEMINI_API_KEY', default=None)
        
        # Try Gemini first
        if gemini_key and len(gemini_key) > 10:
            try:
                print("Attempting Gemini job description generation...")
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(prompt)
                if response.text:
                    return response.text
            except Exception as e:
                print(f"Gemini API error: {e}")

        # Fallback to OpenAI
        if not self.openai_api_key:
            return self._call_huggingface_api(prompt)
        
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        try:
            response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                return response.json()['choices'][0]['message']['content']
            elif response.status_code == 429:
                print("OpenAI Quota exceeded, trying Hugging Face...")
                return self._call_huggingface_api(prompt)
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._call_huggingface_api(prompt)
        
        return self._fallback_generation("", "", [])

    def _call_huggingface_api(self, prompt):
        """Call Hugging Face Inference API as fallback"""
        hf_key = settings.HUGGINGFACE_API_KEY
        if not hf_key:
            return self._fallback_generation("", "", [])
            
        API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
        headers = {"Authorization": f"Bearer {hf_key}"}
        
        try:
            response = requests.post(API_URL, headers=headers, json={
                "inputs": f"<s>[INST] {prompt} [/INST]",
                "parameters": {"max_new_tokens": 1000, "return_full_text": False}
            }, timeout=30)
            
            if response.status_code == 200:
                return response.json()[0]['generated_text']
        except Exception as e:
            print(f"Hugging Face API error: {e}")
            
        return self._fallback_generation("", "", [])
    
    def _fallback_generation(self, title, description, requirements):
        """Fallback generation without AI"""
        return f"""
        {title}
        
        {description}
        
        Requirements:
        - {requirements[0] if requirements else 'Professional experience in relevant field'}
        - Strong communication skills
        - Team collaboration ability
        
        We're looking for someone passionate, skilled, and eager to make an impact!
        """
