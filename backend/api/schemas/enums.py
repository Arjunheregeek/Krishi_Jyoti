from enum import Enum

# Enums
class QueryType(str, Enum):
    VOICE = "voice"
    TEXT = "text"
    IMAGE = "image"

class QueryStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ESCALATED = "escalated"
    FAILED = "failed"

class Language(str, Enum):
    MALAYALAM = "malayalam"
    ENGLISH = "english"
    HINDI = "hindi"
