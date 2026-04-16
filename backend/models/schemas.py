"""
Pydantic models for API request/response schemas.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class TriageRequest(BaseModel):
    """Request body for the /triage endpoint."""
    age: int = Field(..., ge=0, le=120, description="Patient age in years")
    gender: str = Field(..., description="Patient gender: Male, Female, Other")
    symptoms: str = Field(..., min_length=3, description="Symptom description")
    vitals: Optional[str] = Field(None, description="Optional vitals info (BP, temp, etc.)")
    language: str = Field("en", description="Language code: en, ta, hi, te")


class ConditionInfo(BaseModel):
    """A probable medical condition with confidence score."""
    condition: str = Field(..., description="Name of the condition")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0-1")
    description: str = Field(..., description="Simple explanation of the condition")


class TriageResponse(BaseModel):
    """Response body for the /triage endpoint."""
    triage_level: str = Field(
        ...,
        description="Severity: self-care, clinic, hospital, emergency"
    )
    conditions: List[ConditionInfo] = Field(
        default_factory=list,
        description="Top 3 probable conditions"
    )
    first_aid: List[str] = Field(
        default_factory=list,
        description="First-aid instruction steps"
    )
    follow_up_question: Optional[str] = Field(
        None,
        description="Follow-up question if symptoms are unclear"
    )
    disclaimer: str = Field(
        default="This is AI-generated guidance and NOT a medical diagnosis. "
                "Please consult a qualified healthcare professional for proper treatment.",
        description="Medical disclaimer"
    )


class HospitalInfo(BaseModel):
    """Information about a nearby hospital."""
    name: str
    latitude: float
    longitude: float
    distance_km: float
    address: Optional[str] = None
    phone: Optional[str] = None


class HospitalRequest(BaseModel):
    """Request body for the /hospitals endpoint."""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class TranslateRequest(BaseModel):
    """Request body for the /translate endpoint."""
    text: str = Field(..., min_length=1)
    source_language: str = Field(..., description="Source language code")
    target_language: str = Field(..., description="Target language code")


class TranslateResponse(BaseModel):
    """Response body for the /translate endpoint."""
    translated_text: str
    source_language: str
    target_language: str
