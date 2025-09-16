# Krishi Jyoti 🌾

**Voice-First AI-Powered Agricultural Advisory System with Real-Time RAG Pipeline**

Krishi Jyoti is a comprehensive, multilingual agricultural advisory platform designed to empower farmers with AI-driven insights and expert guidance. The system features real-time voice conversation capabilities, intelligent RAG-based government schemes chatbot, and supports voice, text, and image-based queries in multiple Indian languages.

## ✨ Features

### 🎙️ Real-Time Voice Agent
- **🔄 Live Conversation**: Real-time speech-to-text and text-to-speech using Deepgram Nova-2 and Aura models
- **🎤 Voice Queries**: Natural voice conversations for farmers comfortable with speaking
- **🧠 Intelligent Responses**: Powered by GPT-4o-mini for agricultural expertise
- **⚡ Low Latency**: Optimized for real-time agricultural consultations

### 🤖 RAG-Powered Government Schemes Chatbot
- **📋 Schemes Database**: Comprehensive knowledge base of Indian agricultural schemes
- **🔍 Smart Search**: LlamaIndex-powered semantic search through government schemes
- **💡 Contextual Answers**: RAG pipeline provides accurate, source-backed responses
- **🎯 Function Calling**: Intelligent tool usage via Cerebras integration

### Core Functionality
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
│   ├── ai/               # AI/ML services
│   │   ├── voice/        # Real-time voice agent (Deepgram + GPT-4o-mini)
│   │   ├── services/     # Embedding & RAG services (LlamaIndex)
│   │   ├── models/       # Pre-trained embeddings & vector stores
│   │   │   └── embeddings/ # Government schemes embeddings
│   │   ├── implementations/ # Knowledge base sources
│   │   ├── config/       # AI service configurations
│   │   └── scripts/      # Utility scripts for embedding generation
│   ├── ml/               # Machine learning services (planned)
│   └── database_schema.sql # Database schema
├── docs/                 # Documentation
└── tests/                # Test suites
```

### 🔧 AI Technology Stack
- **Voice Processing**: Deepgram Nova-2 (STT) + Aura-Asteria (TTS)
- **Language Model**: GPT-4o-mini for agricultural expertise
- **Embeddings**: OpenAI text-embedding-3-large via LlamaIndex
- **Vector Storage**: Local JSON-based vector stores (cloud-ready)
- **Function Calling**: Cerebras integration for intelligent tool usage

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Supabase account
- OpenAI API key
- Deepgram API key
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
   # Install API dependencies
   cd api
   pip install -r requirements.txt
   
   # Install AI service dependencies
   cd ../ai
   pip install -r requirements.txt
   ```

4. **Setup Environment Variables**
   Create `.env` files in both `backend/api/` and `backend/ai/` directories:
   
   **backend/api/.env:**
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
   
   **backend/ai/.env:**
   ```env
   OPENAI_API_KEY=your_openai_api_key
   DEEPGRAM_API_KEY=your_deepgram_api_key
   CEREBRAS_API_KEY=your_cerebras_api_key
   ```

5. **Setup Supabase Database**
   - Create a new Supabase project
   - Run the SQL schema from `backend/database_schema.sql` in Supabase SQL Editor

6. **Generate Embeddings (First Time Setup)**
   ```bash
   cd backend/ai/scripts
   python generate_embeddings.py
   ```

7. **Run the services**
   
   **Start the API server:**
   ```bash
   cd backend/api
   python main.py
   ```
   
   **Start the Voice Agent (separate terminal):**
   ```bash
   cd backend/ai/voice
   python voice_agent.py
   ```

The API will be available at `http://127.0.0.1:8000`

## ⚙️ Configuration

### API Configuration
Create a `.env` file in the `backend/api` directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### AI Services Configuration
Create a `.env` file in the `backend/ai` directory:

```env
OPENAI_API_KEY=your_openai_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
CEREBRAS_API_KEY=your_cerebras_api_key
```

### Voice Agent Configuration
The voice agent supports various configuration options in `backend/ai/config/base_config.json`:
- Audio settings (sample rate, chunk size)
- Deepgram model selection (Nova-2, Aura-Asteria)
- OpenAI model configuration
- Response timing settings

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

### AI Services

#### Voice Agent
- **Real-time Voice Chat**: Run `backend/ai/voice/voice_agent.py` for live conversation
- **Features**: Continuous listening, real-time transcription, natural voice responses
- **Models**: Deepgram Nova-2 (STT), GPT-4o-mini (LLM), Aura-Asteria (TTS)

#### RAG Pipeline
- **Embedding Generation**: Use `backend/ai/scripts/generate_embeddings.py` 
- **Knowledge Base**: Government schemes in `backend/ai/implementations/Kb/Schemes.md`
- **Vector Storage**: Pre-computed embeddings in `backend/ai/models/embeddings/schemes/`

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
- **AI/ML**: Real-time voice agent, RAG pipeline, disease detection
- **Voice Technology**: Deepgram integration, real-time audio processing  
- **Knowledge Engineering**: Government schemes database, embedding generation
- **Frontend**: Web interface (coming soon)

## 🛠️ Technical Highlights

### Real-Time Voice Processing
- **Low-latency audio streaming** with PyAudio and Deepgram WebSocket
- **Continuous conversation** with voice activity detection
- **Graceful error handling** and connection recovery

### Advanced RAG Pipeline  
- **LlamaIndex integration** for professional embedding workflows
- **OpenAI text-embedding-3-large** for high-quality semantic search
- **Modular architecture** supporting multiple knowledge bases
- **Cerebras function calling** for intelligent tool selection

### Scalable Architecture
- **Microservices design** with separate API and AI services
- **Environment-specific configurations** for development and production
- **Cloud-ready vector storage** with local development support

## 📞 Support

For support, please create an issue in the GitHub repository or contact the development team.

---

**Made with ❤️ for Indian Farmers**
