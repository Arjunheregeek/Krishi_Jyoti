# AI Directory

This directory contains the AI-related components of the Krishi Jyoti project, including voice agents, RAG pipelines, and domain-specific implementations.

## Directory Structure

### Core Components
- **Voice/**: Real-time voice agent implementation using Deepgram
- **services/**: Generic, reusable AI services (embedding, vector, RAG)
- **utils/**: Utility functions and helper scripts
- **models/**: Local storage for embeddings and model artifacts

### RAG Pipeline Components
- **scripts/**: Execution scripts for embedding generation and testing
- **config/**: Configuration files for different domains and base parameters
- **implementations/**: Domain-specific RAG implementations

### Development & Testing
- **Test/**: Testing scripts for various AI models and services
- **venv/**: Virtual environment for isolated dependency management

## Detailed Structure

```
backend/ai/
├── Voice/
│   ├── voice_agent.py           # Real-time Deepgram voice agent
│   └── README.md                # Voice agent documentation
├── services/
│   ├── embedding_service.py     # Generic embedding operations (LlamaIndex + OpenAI)
│   ├── vector_service.py        # Generic Zilliz vector database operations
│   └── rag_service.py           # Generic LlamaIndex RAG pipeline
├── utils/
│   ├── data_processor.py        # Generic text processing and chunking
│   ├── config_loader.py         # Configuration management utilities
│   └── vector_utils.py          # Vector operation helpers
├── models/
│   └── embeddings/              # Local embedding storage by domain
├── scripts/
│   ├── generate_embeddings.py  # Generic embedding generation script
│   ├── upload_vectors.py       # Upload embeddings to Zilliz cloud
│   └── test_pipeline.py        # RAG pipeline testing
├── config/
│   ├── base_config.json        # Default parameters for all domains
│   └── schemes_config.json     # Government schemes specific configuration
├── implementations/
│   └── schemes_rag.py          # Government schemes RAG implementation
└── Test/
    ├── cerebras_test.py        # Cerebras model testing
    └── Emd_test.py            # Embedding functionality tests
```

## RAG Pipeline Architecture

### Neutral Design Philosophy
The RAG pipeline is completely domain-agnostic, allowing reuse across different use cases:

1. **Generic Services Layer**: Reusable functions for embeddings, vector operations, and RAG
2. **Configuration-Driven**: All behavior controlled through JSON configuration files
3. **Domain Implementations**: Specific orchestration for each use case (schemes, agriculture, etc.)

### Key Features
- **LlamaIndex Integration**: Uses built-in OpenAI embedding functions
- **Zilliz Cloud Storage**: Scalable vector database for production
- **Modular Architecture**: Easy to extend for new domains
- **Local Development**: Embeddings stored locally for testing

## Setting Up

1. **Create a Virtual Environment**:
   ```powershell
   python -m venv venv
   ```

2. **Activate the Virtual Environment**:
   ```powershell
   .\venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Environment Variables**:
   Ensure your `.env` file contains:
   ```
   DEEPGRAM_API_KEY=your_deepgram_key
   OPENAI_API_KEY=your_openai_key
   CEREBRAS_API_KEY=your_cerebras_key
   ZILLIZ_API_KEY=your_zilliz_key
   ```

## Usage Examples

### Voice Agent
```bash
cd Voice
python voice_agent.py
```

### RAG Pipeline (Government Schemes)
```python
from implementations.schemes_rag import query_government_schemes
answer = query_government_schemes("What schemes are available for farmers?")
```

### Generic Pipeline Components
```python
from services.embedding_service import create_embeddings
from services.vector_service import search_vectors
from services.rag_service import retrieve_and_generate
```

## Current Implementations

### ✅ Fully Functional
- **Voice Agent**: Real-time speech-to-text and text-to-speech
- **Cerebras Testing**: Fast inference model testing

### 🚧 In Development
- **Government Schemes RAG**: Document retrieval and question answering
- **Generic RAG Pipeline**: Reusable components for any domain

### 📋 Planned
- **Agricultural RAG**: Crop advice and farming techniques
- **Weather RAG**: Climate and weather information
- **Market RAG**: Price and market data

## Technical Stack

### Voice Agent
- **STT**: Deepgram Nova-2
- **LLM**: OpenAI GPT-4o-mini
- **TTS**: Deepgram Aura-Asteria
- **Audio**: PyAudio for real-time I/O

### RAG Pipeline
- **Embeddings**: OpenAI text-embedding-3-large (via LlamaIndex)
- **Vector DB**: Zilliz Cloud
- **Retrieval**: LlamaIndex
- **Generation**: OpenAI/Cerebras models

## Contributing

- Follow the project's coding standards and guidelines
- Use the neutral pipeline architecture for new RAG implementations
- Document any new scripts or models added to the directory
- Test components independently before integration

## Notes

- Sensitive information (API keys) stored in `.env` file
- Local embeddings for development, cloud storage for production
- Each domain implementation imports from generic services
- Configuration-driven approach for maximum reusability
