
import os
from decouple import config
try:
    import google.genai as genai
except ImportError:
    print("Error: google-genai package not found.")
    exit(1)

def test_gemini():
    api_key = config('GEMINI_API_KEY', default=None)
    client = genai.Client(api_key=api_key)
    
    print("Verifying full model names...")
    models = list(client.models.list())
    for m in models:
        # ONLY test models that start with 'models/' if that's what the SDK expects
        print(f"Testing: {m.name}")
        try:
            response = client.models.generate_content(
                model=m.name,
                contents="Hello",
            )
            if response and response.text:
                print(f"===> SUCCESS with {m.name}!")
                print(f"Response: {response.text}")
                return
        except Exception as e:
            if "429" in str(e):
                print(f"   Quota full for {m.name}")
            else:
                print(f"   Error for {m.name}: {str(e)[:100]}")

if __name__ == "__main__":
    test_gemini()
