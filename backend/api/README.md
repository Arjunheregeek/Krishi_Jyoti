# Krishi Jyoti - Backend API

🌾 **Agricultural Intelligence Platform Backend**

A comprehensive backend API service for the Krishi Jyoti platform, providing farmers with weather data, crop recommendations, disease detection, and agricultural advisory services.

## 🚀 Features

### Weather Services
- ✅ Real-time weather data using OpenWeatherMap API
- ✅ Agricultural weather insights and recommendations
- ✅ Irrigation need assessment
- ✅ Pest and disease risk analysis
- ✅ Frost warnings and optimal farming activity suggestions
- ✅ 5-day weather forecasts with agricultural relevance

### Core API Modules
- **Weather API** - Comprehensive weather services for agricultural decisions
- **Crop Management** - Crop recommendations and management advice
- **Disease Detection** - AI-powered plant disease identification
- **Advisory Services** - Expert agricultural guidance
- **Scheme Information** - Government scheme details and eligibility
- **Query Management** - Farmer query handling and responses

## 🛠️ Technology Stack

- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT-based authentication
- **External APIs**: OpenWeatherMap, Agricultural data sources
- **AI/ML**: Scikit-learn for crop recommendations and disease detection
- **Task Queue**: Celery with Redis
- **Documentation**: Auto-generated with FastAPI/Swagger

## 📁 Project Structure

```
backend/api/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (create from .env.example)
├── .gitignore            # Git ignore rules
├── auth/                 # Authentication modules
│   └── security.py
├── database/             # Database configuration
│   └── connection.py
├── models/               # SQLAlchemy models
├── routers/              # API route handlers
│   ├── advisory.py
│   ├── crop.py
│   ├── escalation.py
│   ├── feedback.py
│   ├── health.py
│   ├── queries.py
│   └── schemes.py
├── schemas/              # Pydantic models
│   ├── enums.py
│   ├── escalation.py
│   ├── feedback.py
│   ├── notification.py
│   └── query.py
├── utils/                # Utility functions
├── Wheather/             # Weather service module
│   ├── wheatherapi.py    # Main weather API service
│   ├── demo_weather.py   # Weather API demonstration
│   ├── test_weather_api.py # Weather API testing
│   └── .env              # Weather API configuration
└── venv/                 # Virtual environment
```

## 🚦 Quick Start

### Prerequisites
- Python 3.8+
- PostgreSQL database
- OpenWeatherMap API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arjunheregeek/Krishi_Jyoti.git
   cd Krishi_Jyoti/backend/api
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   ```bash
   # Create .env file in the api folder
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Weather API Setup**
   ```bash
   # Create weather API environment file
   cd Wheather
   echo "weather_api_key=YOUR_OPENWEATHERMAP_API_KEY" > .env
   cd ..
   ```

6. **Database Setup**
   ```bash
   # Create database and run migrations
   alembic upgrade head
   ```

7. **Run the application**
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

Once the server is running, you can access:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🌤️ Weather API Usage

### Basic Weather Functions
```python
from Wheather.wheatherapi import get_weather, get_agricultural_weather, get_forecast

# Get current weather
weather = get_weather(city="New Delhi")
print(f"Temperature: {weather['temperature']}°C")

# Get agricultural insights
agri_data = get_agricultural_weather(city="Punjab")
irrigation_need = agri_data['farming_conditions']['irrigation_needed']['level']
print(f"Irrigation needed: {irrigation_need}")

# Get weather forecast
forecast = get_forecast(city="Mumbai", days=5)
```

### Weather API Features
- **Current Weather**: Temperature, humidity, precipitation, wind
- **Agricultural Insights**: Irrigation needs, pest/disease risk, frost warnings
- **Forecast Data**: 5-day weather predictions with agricultural relevance
- **Location Services**: Coordinate lookup and reverse geocoding

## 🗄️ Environment Variables

Create a `.env` file in the api folder:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost/krishi_jyoti
DATABASE_NAME=krishi_jyoti
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs
OPENWEATHER_API_KEY=your_openweather_api_key

# Redis (for Celery)
REDIS_URL=redis://localhost:6379

# Application
DEBUG=True
LOG_LEVEL=INFO
```

Weather API specific `.env` in `Wheather/` folder:
```env
weather_api_key=your_openweathermap_api_key
```

## 🧪 Testing

### Weather API Testing
```bash
# Test basic weather functionality
cd Wheather
python test_weather_api.py

# Run comprehensive demo
python demo_weather.py

# Test main weather service
python wheatherapi.py
```

### API Testing
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_weather.py

# Run with coverage
pytest --cov=. --cov-report=html
```

## 📊 API Endpoints

### Weather Endpoints
- `GET /weather/current` - Get current weather by city/coordinates
- `GET /weather/forecast` - Get weather forecast
- `GET /weather/agricultural` - Get agricultural weather insights

### Core Endpoints
- `POST /auth/login` - User authentication
- `GET /crops/recommendations` - Get crop recommendations
- `POST /diseases/detect` - Disease detection from images
- `GET /schemes/` - Government scheme information
- `POST /queries/` - Submit farmer queries

## 🚀 Deployment

### Using Docker
```bash
# Build and run with docker-compose
docker-compose up --build
```

### Manual Deployment
1. Set up PostgreSQL database
2. Configure environment variables for production
3. Install dependencies: `pip install -r requirements.txt`
4. Run database migrations: `alembic upgrade head`
5. Start with gunicorn: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation at `/docs`

## 🌟 Acknowledgments

- OpenWeatherMap API for weather data
- FastAPI framework for rapid API development
- SQLAlchemy for robust database operations
- The agricultural research community for domain expertise

---

**Built with ❤️ for farmers and agricultural innovation**

🌾 **Krishi Jyoti - Empowering Agriculture with Technology**