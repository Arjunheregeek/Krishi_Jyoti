# Deepgram Voice Agent Implementation

This directory contains the implementation of a Deepgram voice AI agent for the Krishi Jyoti platform.

## Files

- `deepgram_voice_agent.py` - Main voice agent implementation with real-time speech-to-text and text-to-speech
- `test_deepgram.py` - Basic functionality tests for Deepgram services

## Dependencies

Install the following packages in your virtual environment:

```bash
pip install deepgram-sdk websockets pyaudio python-dotenv asyncio
```

### Additional System Requirements

For **Windows**:
- PyAudio might require additional setup. If you encounter issues, try:
  ```bash
  pip install pipwin
  pipwin install pyaudio
  ```

## Environment Variables

Make sure your `.env` file contains:
```
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

## Usage

### Basic Tests
First, run the basic tests to ensure Deepgram is working:
```bash
python test_deepgram.py
```

### Voice Agent
Run the interactive voice agent:
```bash
python deepgram_voice_agent.py
```

#### Voice Agent Controls:
- Press `s` to start/stop recording
- Press `q` to quit the application
- The agent will respond with voice when you speak

## Features

### Current Implementation:
- Real-time speech-to-text using Deepgram Nova-2 model
- Text-to-speech using Deepgram Aura voices
- WebSocket-based real-time communication
- Audio input/output handling with PyAudio
- Agricultural assistant context for Krishi Jyoti

### Agent Configuration:
- **Listen**: Uses Nova-2 model for speech recognition
- **Think**: Uses Llama-3.1-8b-instant for response generation
- **Speak**: Uses Aura-Asteria voice for text-to-speech
- **Context**: Configured as agricultural assistant for farmers

## Troubleshooting

### Common Issues:

1. **PyAudio Installation Issues**:
   - On Windows: Use `pipwin install pyaudio`
   - On Linux: `sudo apt-get install portaudio19-dev python3-pyaudio`
   - On macOS: `brew install portaudio && pip install pyaudio`

2. **Microphone Access**:
   - Ensure your system allows microphone access
   - Check default audio device settings

3. **WebSocket Connection Issues**:
   - Verify your Deepgram API key is correct
   - Check internet connectivity
   - Ensure the API key has voice agent permissions

4. **Audio Quality Issues**:
   - Use a good quality microphone
   - Minimize background noise
   - Speak clearly and at normal volume

## API Reference

### DeepgramVoiceAgent Class

#### Methods:
- `connect()` - Establish WebSocket connection
- `configure_agent()` - Send agent configuration
- `start_conversation()` - Begin voice interaction
- `start_recording()` - Start microphone recording
- `stop_recording()` - Stop microphone recording
- `play_audio(audio_data)` - Play response audio

#### Configuration Options:
- Audio encoding: Linear16, 16kHz sample rate
- STT Model: Nova-2
- TTS Model: Aura-Asteria
- AI Model: Llama-3.1-8b-instant

## Integration with Krishi Jyoti

This voice agent is designed specifically for agricultural use cases:
- Provides crop advice and farming tips
- Answers weather-related questions
- Offers agricultural best practices
- Maintains farmer-friendly conversation style

## Future Enhancements

- Integration with Krishi Jyoti's crop database
- Weather API integration for real-time updates
- Multi-language support for regional farmers
- Voice command for specific agricultural queries
- Integration with government scheme information
