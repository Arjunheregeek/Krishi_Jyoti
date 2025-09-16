# Deepgram Voice Agent Implementation

This directory contains the implementation of a Deepgram voice AI agent for the Krishi Jyoti platform.

## Files

- `voice_agent.py` - Main real-time voice agent implementation with microphone input and speaker output

## Dependencies

Install the following packages in your virtual environment:

```bash
pip install deepgram-sdk pyaudio python-dotenv requests
```

### Additional System Requirements

For **Windows**:
- PyAudio might require additional setup. If you encounter issues, try:
  ```bash
  pip install pipwin
  pipwin install pyaudio
  ```

## Environment Variables

Make sure your `.env` file in the `backend/ai/` directory contains:
```
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

## Usage

### Voice Agent
Run the interactive voice agent:
```bash
python voice_agent.py
```

#### Voice Agent Controls:
- Simply start talking - the agent listens continuously
- Press `Ctrl+C` to quit the application
- The agent will respond with voice in real-time

## Features

### Current Implementation:
- **Real-time microphone input** - Continuous listening
- **Real-time audio output** - Immediate voice responses through speakers
- **Speech-to-text** using Deepgram Nova-2 model
- **Text-to-speech** using Deepgram Aura-Asteria voice
- **AI responses** using OpenAI GPT-4o-mini
- **WebSocket-based** real-time communication
- **Agricultural assistant** context for Krishi Jyoti farmers

### Agent Configuration:
- **Listen**: Nova-2 model for speech recognition (16kHz input)
- **Think**: GPT-4o-mini for intelligent farming responses
- **Speak**: Aura-Asteria voice for natural speech output (24kHz output)
- **Context**: Configured as helpful farming assistant for Krishi Jyoti
- **Greeting**: Welcomes users as farming assistant

## Technical Details

### Audio Configuration:
- **Input**: Linear16 encoding, 16kHz sample rate, mono channel
- **Output**: Linear16 encoding, 24kHz sample rate, mono channel
- **Real-time processing**: Continuous microphone stream with immediate playback

### Agent Behavior:
- Listens continuously for user speech
- Processes speech in real-time
- Generates contextual farming advice
- Responds immediately with voice output
- Maintains conversation context

## Troubleshooting

### Common Issues:

1. **PyAudio Installation Issues**:
   - On Windows: Use `pipwin install pyaudio`
   - On Linux: `sudo apt-get install portaudio19-dev python3-pyaudio`
   - On macOS: `brew install portaudio && pip install pyaudio`

2. **Microphone/Speaker Access**:
   - Ensure your system allows microphone access
   - Check default audio device settings
   - Make sure speakers are working and not muted

3. **Environment Variables**:
   - Verify `.env` file is in `backend/ai/` directory
   - Ensure `DEEPGRAM_API_KEY` is set correctly
   - Check API key has voice agent permissions

4. **Audio Quality Issues**:
   - Use a good quality microphone
   - Minimize background noise
   - Speak clearly at normal volume
   - Ensure proper microphone positioning

## Integration with Krishi Jyoti

This voice agent is designed specifically for agricultural use cases:
- Provides practical crop advice and farming techniques
- Offers short, actionable farming tips
- Maintains farmer-friendly conversation style
- Focuses on agricultural context and solutions

## Architecture

### Components:
- **WebSocket Connection**: Real-time communication with Deepgram
- **Event Handlers**: Process audio data, conversation text, and agent states
- **PyAudio Streams**: Handle microphone input and speaker output
- **Threading**: Keep-alive functionality and microphone streaming
- **Error Handling**: Graceful cleanup and error recovery

### Flow:
1. Initialize Deepgram client and WebSocket connection
2. Configure agent settings (STT, LLM, TTS)
3. Start microphone streaming thread
4. Process real-time audio and generate responses
5. Play responses through speakers immediately
6. Handle graceful shutdown on Ctrl+C
