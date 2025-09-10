from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Notification Schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: str = "info"  # info, warning, alert
    farmer_phone: Optional[str] = None  # For anonymous notifications

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: str
    is_read: bool = False
    created_at: datetime
