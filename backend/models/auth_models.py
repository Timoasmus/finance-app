from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr

class Plan(Enum):
    free="free"
    premium="premium"

class Auth(BaseModel):
    authenticated: bool
    plan: Optional[Plan] = None

class NewUser(BaseModel):
    username: str
    email: EmailStr
    password: str  
    dob: datetime

class ChangeSubscriptionRequest(BaseModel):
    password: str
    plan: Plan