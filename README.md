# Krishi Jyoti 🌾

**Voice-First AI-Powered Agricultural Advisory System**

Krishi Jyoti is a comprehensive, multilingual agricultural advisory platform designed to empower farmers with AI-driven insights and expert guidance. The system supports voice, text, and image-based queries in multiple Indian languages.

## ✨ Features

### Core Functionality
- **🎤 Voice Queries**: Speech-to-text processing for farmers comfortable with voice input
- **💬 Text Queries**: Multilingual text support (Malayalam, English, Hindi)
- **📸 Image Analysis**: Crop disease detection and analysis through image uploads
- **🔄 Real-time Responses**: Instant AI-powered agricultural advice

### Specialized Services
- **🌱 Crop Disease Detection**: AI-powered identification of plant diseases
- **🎯 Crop Recommendations**: Personalized crop suggestions based on location, season, and soil
- **🏛️ Government Schemes**: Information about agricultural subsidies and schemes
- **💰 MSP Information**: Minimum Support Price updates and market information
- **⚡ Expert Escalation**: Complex queries routed to agricultural officers
- **📢 Smart Notifications**: Alerts for weather, diseases, and government announcements

## 🏗️ Architecture

```
krishi-jyoti/
├── frontend/              # Web interface (planned)
├── backend/
│   ├── api/              # FastAPI application
│   │   ├── routers/      # API endpoints
│   │   ├── models/       # Service layer
│   │   └── schemas/      # Pydantic models
│   ├── ai/               # AI/ML models (planned)
│   ├── ml/               # Machine learning services (planned)
│   └── database_schema.sql # Database schema
├── docs/                 # Documentation
└── tests/                # Test suites
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Supabase account
- Virtual environment (recommended)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arjunheregeek/Krishi_Jyoti.git
   cd krishi-jyoti
   ```

2. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup Supabase Database**
   - Create a new Supabase project
   - Run the SQL schema from `backend/database_schema.sql` in Supabase SQL Editor
   - Configure environment variables (see Configuration section)

5. **Run the application**
   ```bash
   cd api
   python main.py
   ```

The API will be available at `http://127.0.0.1:8000`

## ⚙️ Configuration

Create a `.env` file in the `backend` directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/query/text` | POST | Submit text queries |
| `/api/v1/query/voice` | POST | Upload voice recordings |
| `/api/v1/query/image` | POST | Upload crop images |
| `/api/v1/feedback` | POST | Submit feedback |
| `/api/v1/crop/disease-detection` | POST | Detect crop diseases |
| `/api/v1/crop/recommendations` | GET | Get crop recommendations |
| `/api/v1/schemes/government` | GET | Get government schemes |
| `/api/v1/schemes/msp` | GET | Get MSP information |

## 🗄️ Database Schema

The system uses a PostgreSQL database through Supabase with the following main tables:

- **queries**: Stores all farmer queries (voice, text, image)
- **feedback**: User feedback and ratings
- **escalations**: Complex queries routed to experts
- **notifications**: System alerts and announcements

## 🌐 Supported Languages

- **Malayalam** (മലയാളം)
- **English**
- **Hindi** (हिंदी)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development**: FastAPI, Supabase integration
- **AI/ML**: Disease detection, crop recommendations
- **Frontend**: Web interface (coming soon)

## 📞 Support

For support, please create an issue in the GitHub repository or contact the development team.

---

**Made with ❤️ for Indian Farmers**
