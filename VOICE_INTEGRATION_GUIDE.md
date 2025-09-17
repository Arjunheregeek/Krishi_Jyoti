# Voice Integration Setup Guide

## Audio Format Compatibility

### Backend Requirements (Matching original voice_agent.py)
- **Input Audio**: 16kHz, 1 channel, 16-bit PCM (linear16)
- **Output Audio**: 24kHz, 1 channel, 16-bit PCM
- **Data Format**: Raw binary audio streams
- **Encoding**: No compression, direct PCM data

### Frontend Implementation
- **Recording**: MediaRecorder with webm/opus → converted to raw PCM
- **Playback**: Raw PCM → Web Audio API with proper sample rate handling
- **Streaming**: Real-time chunks every 100ms for low latency

## Files Integration

### 1. Backend Components

**voice_agent.py** (Original - No Changes)
- Standalone PyAudio-based voice agent
- Direct Deepgram WebSocket connection
- Console-based interaction

**voice_agent_class.py** (New - Reusable Class)
- Exact same configuration as original
- Added WebSocket callback system
- Maintains all original event handlers and console output
- Compatible audio format (16kHz input, 24kHz output)

**voice_ws.py** (WebSocket Router)
- Handles WebSocket connections from frontend
- Audio format conversion and base64 encoding for JSON
- Robust error handling and connection management
- Status updates and real-time communication

### 2. Key Integration Points

**Audio Data Flow**
```
Frontend MediaRecorder (webm) → WebSocket → voice_ws.py → voice_agent_class.py → Deepgram
Deepgram → voice_agent_class.py → voice_ws.py → WebSocket → Frontend Audio API
```

**Message Types**
- `partial_transcript`: Real-time transcription updates
- `agent_response`: Final text responses
- `agent_audio`: Base64-encoded PCM audio (24kHz)
- `status`: Agent state (ready, listening, thinking, speaking)
- `error`: Error messages and debugging info

## Backend Setup

1. **Install Voice Dependencies**
   ```bash
   cd backend/api
   pip install -r requirements.txt
   ```

2. **Environment Configuration**
   Create or update your `.env` file in `backend/ai/` with:
   ```env
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start the API Server**
   ```bash
   cd backend/api
   python main.py
   ```
   The server will run on `http://localhost:8000`
   WebSocket endpoint: `ws://localhost:8000/ws/voice`

## Frontend Setup

1. **Install Dependencies** (if not already done)
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## Testing the Voice Integration

1. **Check Connection Status**
   - Open the frontend in your browser
   - Navigate to the Voice Support section
   - Look for the WiFi icon showing connection status
   - Status should show "connected" when WebSocket is working

2. **Test Voice Flow**
   - Click microphone button to start recording
   - Speak a farming question (e.g., "What crops should I plant in winter?")
   - Watch for real-time status updates (listening → thinking → speaking)
   - Receive text response and audio playback
   - Check query history for complete conversation

3. **Audio Quality Check**
   - Ensure clear audio input (check microphone permissions)
   - Verify audio output plays back clearly
   - Test in different browsers (Chrome, Firefox, Safari)

## Troubleshooting

### Backend Issues
- **ImportError**: Ensure all dependencies are installed with `pip install -r requirements.txt`
- **Deepgram Connection**: Verify API key in `.env` file
- **WebSocket Errors**: Check if port 8000 is available
- **Audio Processing**: Ensure OpenAI API key is configured

### Frontend Issues
- **WebSocket Connection Failed**: 
  - Ensure backend is running on localhost:8000
  - Check browser console for CORS or connection errors
  - Verify WebSocket URL is correct
- **Microphone Access Denied**: 
  - Grant microphone permissions in browser settings
  - Test on HTTPS in production (required for microphone access)
- **Audio Playback Issues**: 
  - Check browser audio settings and volume
  - Ensure Web Audio API is supported
  - Try different browsers

### Audio Format Issues
- **Choppy Audio**: Reduce chunk size in MediaRecorder
- **No Audio Playback**: Check PCM decoding and sample rate conversion
- **Recording Not Working**: Verify microphone constraints match backend expectations

## Architecture Overview

```
Frontend (React)
    ↕ WebSocket (ws://localhost:8000/ws/voice)
FastAPI Backend (/ws/voice)
    ↕ Callback System
VoiceAgent Class
    ↕ WebSocket (Exact same as original)
Deepgram Cloud API
```

## Features Implemented

### Backend
- ✅ VoiceAgent class maintaining 100% compatibility with original
- ✅ WebSocket endpoint with proper audio format handling
- ✅ Base64 encoding for JSON-safe audio transmission
- ✅ Real-time status updates and error handling
- ✅ Async callback system for WebSocket communication

### Frontend
- ✅ WebSocket client with auto-reconnection
- ✅ Real-time audio recording with proper format conversion
- ✅ PCM audio playback with correct sample rate handling
- ✅ Visual connection status and recording feedback
- ✅ Multilingual support and query history
- ✅ Graceful error handling and user feedback

## Production Considerations

### Security
- Add WebSocket authentication and authorization
- Implement rate limiting for voice requests
- Secure API key management

### Performance
- Implement audio compression for reduced bandwidth
- Add connection pooling for multiple users
- Optimize chunk sizes for network conditions

### Scalability
- Add Redis for session management
- Implement load balancing for WebSocket connections
- Monitor Deepgram API usage and costs

### Monitoring
- Add logging for audio processing metrics
- Track user interaction patterns
- Monitor WebSocket connection health

## Compatibility Notes

- **Browser Support**: Chrome, Firefox, Safari (latest versions)
- **Mobile Support**: Requires HTTPS for microphone access
- **Audio Formats**: Handles webm/opus → PCM conversion automatically
- **Network**: Works on local development, requires HTTPS for production

The integration maintains complete compatibility with the original voice_agent.py while adding WebSocket capabilities for frontend integration.