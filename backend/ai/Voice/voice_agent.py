import requests
import wave
import io
import time
import os
import json
import threading
from datetime import datetime
from dotenv import load_dotenv
import pyaudio

from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    AgentWebSocketEvents,
    AgentKeepAlive,
)
from deepgram.clients.agent.v1.websocket.options import SettingsOptions

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# WAV Header Functions
def create_wav_header(sample_rate=24000, bits_per_sample=16, channels=1):
    """Create a WAV header with the specified parameters"""
    byte_rate = sample_rate * channels * (bits_per_sample // 8)
    block_align = channels * (bits_per_sample // 8)

    header = bytearray(44)
    header[0:4] = b'RIFF'
    header[4:8] = b'\x00\x00\x00\x00'
    header[8:12] = b'WAVE'
    header[12:16] = b'fmt '
    header[16:20] = b'\x10\x00\x00\x00'
    header[20:22] = b'\x01\x00'
    header[22:24] = channels.to_bytes(2, 'little')
    header[24:28] = sample_rate.to_bytes(4, 'little')
    header[28:32] = byte_rate.to_bytes(4, 'little')
    header[32:34] = block_align.to_bytes(2, 'little')
    header[34:36] = bits_per_sample.to_bytes(2, 'little')
    header[36:40] = b'data'
    header[40:44] = b'\x00\x00\x00\x00'
    return header

def main():
    try:
        print("🎤 Starting Krishi Jyoti Voice Agent...")
        
        # Initialize the Voice Agent
        api_key = os.getenv("DEEPGRAM_API_KEY")
        if not api_key:
            raise ValueError("DEEPGRAM_API_KEY environment variable is not set")
        print("✅ API Key found")

        # Initialize Deepgram client
        config = DeepgramClientOptions(options={"keepalive": "true"})
        deepgram = DeepgramClient(api_key, config)
        connection = deepgram.agent.websocket.v("1")
        print("✅ Created WebSocket connection")

        # Configure the Agent
        options = SettingsOptions()
        options.audio.input.encoding = "linear16"
        options.audio.input.sample_rate = 16000
        options.audio.output.encoding = "linear16"
        options.audio.output.sample_rate = 24000
        options.audio.output.container = "none"
        options.agent.language = "en"
        options.agent.listen.provider.type = "deepgram"
        options.agent.listen.provider.model = "nova-2"
        options.agent.think.provider.type = "open_ai"
        options.agent.think.provider.model = "gpt-4o-mini"
        options.agent.think.prompt = (
            "You are a helpful farming assistant for Krishi Jyoti. "
            "Give practical advice about crops, soil, and farming techniques. "
            "Keep responses short and actionable."
        )
        options.agent.speak.provider.type = "deepgram"
        options.agent.speak.provider.model = "aura-asteria-en"
        options.agent.greeting = (
            "Hello! I'm your Krishi Jyoti farming assistant. "
            "How can I help with your farm today?"
        )

        # Setup PyAudio
        audio = pyaudio.PyAudio()
        mic_stream = audio.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=16000,
            input=True,
            frames_per_buffer=1024
        )
        speaker_stream = audio.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=24000,
            output=True,
            frames_per_buffer=1024
        )
        print("🔊 Audio setup complete")

        # Keep-alive sender
        def send_keep_alive():
            while True:
                time.sleep(5)
                connection.send(str(AgentKeepAlive()))

        keep_alive_thread = threading.Thread(target=send_keep_alive, daemon=True)
        keep_alive_thread.start()

        # Shared state
        audio_buffer = bytearray()
        file_counter = 0
        running = True

        # Event Handlers
        def on_audio_data(self, data, **kwargs):
            nonlocal audio_buffer
            audio_buffer.extend(data)
            try:
                speaker_stream.write(data)
            except Exception as e:
                print(f"⚠️ Audio playback error: {e}")

        def on_agent_audio_done(self, agent_audio_done, **kwargs):
            nonlocal audio_buffer, file_counter
            print("✅ Response complete")
            if len(audio_buffer) > 0:
                filename = f"response-{file_counter}.wav"
                with open(filename, 'wb') as f:
                    f.write(create_wav_header())
                    f.write(audio_buffer)
                file_counter += 1
            audio_buffer = bytearray()

        def on_conversation_text(self, conversation_text, **kwargs):
            try:
                role = getattr(conversation_text, 'role', 'unknown')
                content = getattr(conversation_text, 'content', str(conversation_text))
                if role == 'user':
                    print(f"👤 You: {content}")
                elif role == 'assistant':
                    print(f"🤖 Assistant: {content}")
            except:
                pass

        def on_welcome(self, welcome, **kwargs):
            print("🎉 Voice agent ready! Start talking...")

        def on_user_started_speaking(self, user_started_speaking, **kwargs):
            nonlocal audio_buffer
            audio_buffer.clear()
            print("🎤 Listening...")

        def on_agent_started_speaking(self, agent_started_speaking, **kwargs):
            nonlocal audio_buffer
            audio_buffer = bytearray()

        def on_error(self, error, **kwargs):
            print(f"❌ Error: {error}")

        def on_settings_applied(self, settings_applied, **kwargs): pass
        def on_agent_thinking(self, agent_thinking, **kwargs): pass
        def on_close(self, close, **kwargs): pass
        def on_unhandled(self, unhandled, **kwargs): pass

        # Register handlers
        connection.on(AgentWebSocketEvents.AudioData, on_audio_data)
        connection.on(AgentWebSocketEvents.AgentAudioDone, on_agent_audio_done)
        connection.on(AgentWebSocketEvents.ConversationText, on_conversation_text)
        connection.on(AgentWebSocketEvents.Welcome, on_welcome)
        connection.on(AgentWebSocketEvents.SettingsApplied, on_settings_applied)
        connection.on(AgentWebSocketEvents.UserStartedSpeaking, on_user_started_speaking)
        connection.on(AgentWebSocketEvents.AgentThinking, on_agent_thinking)
        connection.on(AgentWebSocketEvents.AgentStartedSpeaking, on_agent_started_speaking)
        connection.on(AgentWebSocketEvents.Close, on_close)
        connection.on(AgentWebSocketEvents.Error, on_error)
        connection.on(AgentWebSocketEvents.Unhandled, on_unhandled)
        print("✅ Event handlers registered")

        print("🚀 Starting WebSocket connection...")
        if not connection.start(options):
            print("❌ Failed to start connection")
            return
        print("✅ WebSocket connection started successfully")

        # Stream microphone audio
        def stream_microphone():
            nonlocal running
            while running:
                try:
                    data = mic_stream.read(1024, exception_on_overflow=False)
                    connection.send(data)
                    time.sleep(0.01)
                except Exception as e:
                    print(f"⚠️ Microphone error: {e}")
                    break

        print("🎤 Starting microphone stream...")
        mic_thread = threading.Thread(target=stream_microphone, daemon=True)
        mic_thread.start()

        print("Press Ctrl+C to stop")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n👋 Stopping voice agent...")
            running = False

        # Cleanup
        mic_stream.stop_stream()
        mic_stream.close()
        speaker_stream.stop_stream()
        speaker_stream.close()
        audio.terminate()
        connection.finish()
        print("🧹 Cleanup complete")

    except Exception as e:
        print(f"Error: {str(e)}")
        try:
            speaker_stream.stop_stream()
            speaker_stream.close()
            audio.terminate()
        except:
            pass

if __name__ == "__main__":
    main()
