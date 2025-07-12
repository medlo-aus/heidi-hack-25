from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class VisitSummary(BaseModel):
    patient_name: str
    diagnosis: str
    medications: List[str]
    referrals: List[str]
    recommendations: str
    nex_appointment: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]

class Medication(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None

class Referrals(BaseModel):
    specialist: str
    location: Optional[str] = None
    contact: Optional[str] = None

class SendSummaryResponse(BaseModel):
    email_sent: bool
    sms_sent: bool
    calendar_event_created: bool
    message: Optional[str]
