# Krishi Jyoti Backend API 🌾

Voice-First AI-Powered Agricultural Advisory System backend built with FastAPI and Supabase.

## Features

- **🎤 Voice Query Processing**: Accept and process voice inputs from farmers
- **💬 Text Query Handling**: Process text queries in Malayalam, English, and Hindi
- **📸 Image Analysis**: Upload and analyze crop disease photos
- **🌱 Crop Disease Detection**: AI-powered disease identification
- **🎯 Crop Recommendations**: Personalized crop suggestions
- **🏛️ Government Schemes**: MSP and subsidy information
- **📋 Feedback System**: Capture user feedback on advice
- **⚡ Escalation System**: Forward complex queries to agricultural officers
- **📢 Notification System**: Send alerts and updates to farmers

## Tech Stack

- **FastAPI**: Modern Python web framework for high-performance APIs
- **Supabase**: PostgreSQL database with real-time features
- **Pydantic**: Data validation and serialization
- **Python-multipart**: File upload handling for voice/image
- **Pillow**: Image processing capabilities
- **aiofiles**: Async file operations

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Supabase configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App configuration
DEBUG=True
```

### 4. Database Setup

1. Create a new project in [Supabase](https://supabase.com)
2. Copy your project URL and API keys to the `.env` file
3. Run the SQL schema from `backend/database_schema.sql` in your Supabase SQL editor

### 5. Run the Application

```bash
cd backend/api
python main.py
```

The API will be available at `http://127.0.0.1:8000`

## API Documentation

Once running, visit:
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

## API Endpoints

### Query Endpoints
- `POST /api/v1/query/voice` - Submit voice queries
- `POST /api/v1/query/text` - Submit text queries  
- `POST /api/v1/query/image` - Submit image queries
- `GET /api/v1/query/result/{query_id}` - Get query results

### Crop Services
- `POST /api/v1/crop/disease-detection` - Detect crop diseases from images
- `GET /api/v1/crop/recommendations` - Get crop recommendations

### Government Services
- `GET /api/v1/schemes/government` - Get government schemes
- `GET /api/v1/schemes/msp` - Get MSP information
- `GET /api/v1/schemes/subsidies` - Get subsidy information

### Feedback & Support
- `POST /api/v1/feedback` - Submit feedback
- `POST /api/v1/escalation` - Escalate queries

### System
- `GET /api/v1/health` - Health check

## Project Structure

```
backend/
├── api/                    # FastAPI application
│   ├── main.py            # Application entry point
│   ├── routers/           # API route handlers
│   │   ├── queries.py     # Query endpoints (voice, text, image)
│   │   ├── feedback.py    # Feedback endpoints
│   │   ├── escalation.py  # Escalation endpoints
│   │   ├── crop.py        # Crop services (disease, recommendations)
│   │   ├── schemes.py     # Government schemes and MSP
│   │   └── health.py      # Health check endpoints
│   ├── models/            # Service layer
│   │   ├── query_service.py        # Query processing logic
│   │   ├── feedback_service.py     # Feedback management
│   │   ├── escalation_service.py   # Escalation handling
│   │   └── notification_service.py # Notifications
│   └── schemas/           # Pydantic models
│       ├── enums.py       # Enums (QueryType, Language, etc.)
│       ├── query.py       # Query-related schemas
│       ├── feedback.py    # Feedback schemas
│       ├── escalation.py  # Escalation schemas
│       └── notification.py # Notification schemas
├── database_schema.sql    # Complete database schema
├── requirements.txt       # Python dependencies
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Supported Languages

- **Malayalam** (മലയാളം)
- **English**
- **Hindi** (हिंदी)

## Database Schema

The system uses PostgreSQL through Supabase with these main tables:

- **queries**: All farmer queries (voice, text, image) with context
- **feedback**: User feedback and ratings (1-5 scale)
- **escalations**: Complex queries routed to agricultural officers
- **notifications**: System alerts and announcements

## Development Status

✅ **Completed:**
- Modular FastAPI application structure
- Database schema design and implementation
- API endpoints for all core features
- Pydantic models for data validation
- Error handling and logging

🚧 **In Progress:**
- AI/ML integration for disease detection
- Voice processing (speech-to-text)
- Image analysis pipeline

📋 **Planned:**
- Frontend integration
- Authentication system
- Push notifications
- Advanced analytics

## Next Steps

1. **Setup Environment**: Install dependencies and configure Supabase
2. **Create Database Tables**: Run the database schema
3. **Test API Endpoints**: Use Swagger UI to test functionality
4. **Implement AI Services**: Add disease detection and recommendation logic
5. **Frontend Integration**: Connect to web/mobile frontend

## Development Notes

- The system is designed for anonymous usage (no mandatory authentication)
- All endpoints support optional farmer context (name, phone, location)
- AI/ML integration points are marked with TODO comments
- Error handling includes proper HTTP status codes and messages

## Support

For backend-specific issues and questions:
1. Check the API documentation at `/docs`
2. Review the database schema
3. Create an issue in the repository
