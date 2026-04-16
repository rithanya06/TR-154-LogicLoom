"""
Rural Health AI — FastAPI Backend
Main application entry point with API routes.
"""

import os
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables early so services can use them
from dotenv import load_dotenv
load_dotenv()

from models.schemas import (
    TriageRequest,
    TriageResponse,
    ConditionInfo,
    HospitalRequest,
    HospitalInfo,
    TranslateRequest,
    TranslateResponse,
)
from services.ai_service import get_triage_response
from services.translation_service import translate_text, translate_triage_response
from services.hospital_service import find_nearby_hospitals

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("Rural Health AI Backend starting up...")
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        logger.warning("⚠️  GROQ_API_KEY not set! AI features will not work.")
    else:
        logger.info("✅ Groq API key found")
    yield
    logger.info("Rural Health AI Backend shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Rural Health AI API",
    description="Multilingual Symptom Triage Assistant for Rural Healthcare",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Rural Health AI API",
        "version": "1.0.0"
    }


@app.post("/triage", response_model=TriageResponse)
async def triage_symptoms(request: TriageRequest):
    """
    Analyze patient symptoms and return triage assessment.
    
    Accepts symptoms in any supported language, translates to English for AI processing,
    then translates the response back to the requested language.
    """
    try:
        logger.info(
            f"Triage request: age={request.age}, gender={request.gender}, "
            f"lang={request.language}"
        )
        
        # Step 1: Translate symptoms to English if needed
        symptoms_en = request.symptoms
        vitals_en = request.vitals
        
        if request.language != "en":
            logger.info(f"Translating symptoms from {request.language} to English")
            symptoms_en = translate_text(
                request.symptoms, request.language, "en"
            )
            if request.vitals:
                vitals_en = translate_text(
                    request.vitals, request.language, "en"
                )
        
        # Step 2: Get AI triage response
        ai_result = get_triage_response(
            age=request.age,
            gender=request.gender,
            symptoms=symptoms_en,
            vitals=vitals_en
        )
        
        # Step 3: Translate response back to requested language
        if request.language != "en":
            logger.info(f"Translating response to {request.language}")
            ai_result = translate_triage_response(ai_result, request.language)
        
        # Step 4: Build response
        conditions = [
            ConditionInfo(
                condition=c.get("condition", "Unknown"),
                confidence=min(max(float(c.get("confidence", 0)), 0.0), 1.0),
                description=c.get("description", "")
            )
            for c in ai_result.get("conditions", [])
        ]
        
        response = TriageResponse(
            triage_level=ai_result.get("triage_level", "clinic"),
            conditions=conditions,
            first_aid=ai_result.get("first_aid", []),
            follow_up_question=ai_result.get("follow_up_question"),
            disclaimer=ai_result.get(
                "disclaimer",
                "This is AI-generated guidance and NOT a medical diagnosis. "
                "Please consult a qualified healthcare professional."
            )
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Triage error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process triage request: {str(e)}"
        )


@app.post("/hospitals")
async def get_hospitals(request: HospitalRequest):
    """
    Find nearby hospitals using OpenStreetMap Overpass API.
    """
    try:
        logger.info(f"Hospital search: lat={request.latitude}, lon={request.longitude}")
        
        hospitals = await find_nearby_hospitals(
            latitude=request.latitude,
            longitude=request.longitude
        )
        
        return {
            "hospitals": [
                HospitalInfo(**h) for h in hospitals
            ],
            "count": len(hospitals)
        }
        
    except Exception as e:
        logger.error(f"Hospital search error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search hospitals: {str(e)}"
        )


@app.post("/translate", response_model=TranslateResponse)
async def translate(request: TranslateRequest):
    """
    Translate text between supported languages.
    """
    try:
        translated = translate_text(
            text=request.text,
            source_lang=request.source_language,
            target_lang=request.target_language
        )
        
        return TranslateResponse(
            translated_text=translated,
            source_language=request.source_language,
            target_language=request.target_language
        )
        
    except Exception as e:
        logger.error(f"Translation error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to translate: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    # Listening on 0.0.0.0 allows connections from other devices on the same network
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
