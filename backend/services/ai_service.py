"""
AI Triage Service — Uses Groq API with LLaMA 3 for medical symptom triage.
"""

import json
import os
import logging

from groq import Groq

logger = logging.getLogger(__name__)

# Initialize Groq client with placeholder if env var missing; will fail on usage but allow app to start
api_key = os.environ.get("GROQ_API_KEY", "")
client = Groq(api_key=api_key) if api_key else None

SYSTEM_PROMPT = """You are a medical triage assistant designed for rural healthcare settings. 
Your role is to analyze patient symptoms and provide preliminary guidance.

IMPORTANT RULES:
1. You are NOT a doctor. Always include a disclaimer.
2. If symptoms are unclear or insufficient, ask ONE specific follow-up question.
3. Predict the top 3 most probable conditions with confidence scores (0.0 to 1.0).
4. Assign a triage level based on severity:
   - "self-care": Minor issues manageable at home (e.g., mild cold, small cuts)
   - "clinic": Needs a doctor visit but not urgent (e.g., persistent cough, mild infection)
   - "hospital": Requires hospital care soon (e.g., high fever with complications, fractures)
   - "emergency": Life-threatening, seek immediate help (e.g., chest pain, severe bleeding, breathing difficulty)
5. Provide simple, easy-to-understand first-aid steps using basic language.
6. Keep language simple — this is for rural users who may have limited medical knowledge.
7. ALWAYS respond in valid JSON format only. No markdown, no extra text."""

USER_PROMPT_TEMPLATE = """Analyze the following patient information and provide a medical triage assessment.

PATIENT INFORMATION:
- Age: {age} years
- Gender: {gender}
- Symptoms: {symptoms}
- Vitals: {vitals}

Think step by step:
1. Consider the patient's age and gender for relevant conditions
2. Analyze the symptoms carefully
3. Consider any vital signs provided
4. Determine the most likely conditions
5. Assess the severity for triage level
6. Provide practical first-aid advice

Respond ONLY with a JSON object in this exact format:
{{
    "triage_level": "self-care|clinic|hospital|emergency",
    "conditions": [
        {{
            "condition": "Condition Name",
            "confidence": 0.85,
            "description": "Simple explanation of what this condition is"
        }},
        {{
            "condition": "Another Condition",
            "confidence": 0.60,
            "description": "Simple explanation"
        }},
        {{
            "condition": "Third Possibility",
            "confidence": 0.30,
            "description": "Simple explanation"
        }}
    ],
    "first_aid": [
        "Step 1: Clear, simple instruction",
        "Step 2: Another instruction",
        "Step 3: When to seek help"
    ],
    "follow_up_question": "A specific question to ask if symptoms are unclear, or null if symptoms are clear enough"
}}"""


def get_triage_response(age: int, gender: str, symptoms: str, vitals: str = None) -> dict:
    """
    Send patient data to Groq LLaMA 3 and get structured triage response.
    
    Args:
        age: Patient age in years
        gender: Patient gender
        symptoms: Described symptoms (in English)
        vitals: Optional vital signs
        
    Returns:
        dict: Structured triage response
    """
    vitals_text = vitals if vitals else "Not provided"
    
    user_prompt = USER_PROMPT_TEMPLATE.format(
        age=age,
        gender=gender,
        symptoms=symptoms,
        vitals=vitals_text
    )
    
    try:
        if not client:
            return {
                "triage_level": "clinic",
                "conditions": [{"condition": "API Key Missing", "confidence": 0.0, "description": "Backend AI is not configured."}],
                "first_aid": ["Please check backend configuration."],
                "follow_up_question": "Is the Groq API key configured on the server?"
            }
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Validate and sanitize the response
        valid_levels = {"self-care", "clinic", "hospital", "emergency"}
        if result.get("triage_level") not in valid_levels:
            result["triage_level"] = "clinic"
        
        # Ensure conditions list exists and is capped at 3
        if "conditions" not in result or not isinstance(result["conditions"], list):
            result["conditions"] = []
        result["conditions"] = result["conditions"][:3]
        
        # Ensure first_aid exists
        if "first_aid" not in result or not isinstance(result["first_aid"], list):
            result["first_aid"] = ["Please consult a healthcare professional for proper guidance."]
        
        logger.info(f"Triage completed: level={result['triage_level']}")
        return result
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {e}")
        return {
            "triage_level": "clinic",
            "conditions": [
                {
                    "condition": "Unable to determine",
                    "confidence": 0.0,
                    "description": "The AI could not analyze the symptoms properly. Please consult a doctor."
                }
            ],
            "first_aid": ["Please visit your nearest healthcare center for a proper checkup."],
            "follow_up_question": "Could you describe your symptoms in more detail?"
        }
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise
