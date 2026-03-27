import sys
import os

# Add the project root to sys.path
sys.path.append(r'c:\Users\BHARAT\Downloads\resu-match-ui-build\backend')

try:
    import spacy
    print("Spacy version:", spacy.__version__)
    nlp = spacy.load('en_core_web_sm')
    print("Success loading en_core_web_sm")
    
    from ml_models.resume_refiner import ResumeRefiner
    refiner = ResumeRefiner()
    print("Success instantiating ResumeRefiner")
except Exception as e:
    print("Error:", str(e))
    import traceback
    traceback.print_exc()
