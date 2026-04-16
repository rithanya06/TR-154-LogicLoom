"""
Translation Service — Uses Groq API for translating between Indian languages and English.
"""

import json
import os
import logging

from groq import Groq

logger = logging.getLogger(__name__)

api_key = os.environ.get("GROQ_API_KEY", "")
client = Groq(api_key=api_key) if api_key else None

LANGUAGE_MAP = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu"
}

TRANSLATE_SYSTEM_PROMPT = """You are a precise translator. Translate the given text accurately.
Keep medical terms clear and understandable. Use simple language suitable for rural users.
Respond ONLY with a JSON object: {{"translated_text": "your translation here"}}
Do not add explanations or extra text."""


def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translate text between languages using Groq LLaMA 3.
    
    Args:
        text: Text to translate
        source_lang: Source language code (en, hi, ta, te)
        target_lang: Target language code (en, hi, ta, te)
        
    Returns:
        Translated text string
    """
    # No translation needed if same language
    if source_lang == target_lang:
        return text
    
    source_name = LANGUAGE_MAP.get(source_lang, "English")
    target_name = LANGUAGE_MAP.get(target_lang, "English")
    
    user_prompt = (
        f"Translate the following text from {source_name} to {target_name}.\n"
        f"Keep it simple and easy to understand for rural users.\n\n"
        f"Text to translate:\n{text}"
    )
    
    try:
        if not client:
            return text
            
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": TRANSLATE_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=1024,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        translated = result.get("translated_text", text)
        
        logger.info(f"Translated {source_lang} -> {target_lang}: {len(text)} chars")
        return translated
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        # Return original text if translation fails
        return text


def translate_triage_response(triage_result: dict, target_lang: str) -> dict:
    """
    Translate the entire triage response to the target language.
    
    Args:
        triage_result: Triage response dict from AI service
        target_lang: Target language code
        
    Returns:
        Translated triage response dict
    """
    if target_lang == "en":
        return triage_result
    
    target_name = LANGUAGE_MAP.get(target_lang, "English")
    
    # Build a combined text for efficient translation
    translate_prompt = f"""Translate ALL the following medical triage information from English to {target_name}.
Keep medical terms understandable. Use simple language for rural users.

Respond ONLY with a JSON object matching this exact structure:

Original data to translate:
{json.dumps(triage_result, indent=2)}

Return the same JSON structure but with ALL text values translated to {target_name}.
Keep the keys in English. Only translate the string values.
Keep "triage_level" value in English (self-care, clinic, hospital, emergency).
Keep numeric values (confidence scores) unchanged."""

    try:
        if not client:
            return triage_result
            
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a medical translator. Respond only with valid JSON."},
                {"role": "user", "content": translate_prompt}
            ],
            temperature=0.2,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )
        
        translated_result = json.loads(response.choices[0].message.content)
        
        # Preserve triage_level in English
        translated_result["triage_level"] = triage_result.get("triage_level", "clinic")
        
        logger.info(f"Translated full triage response to {target_lang}")
        return translated_result
        
    except Exception as e:
        logger.error(f"Full translation error: {e}")
        return triage_result
