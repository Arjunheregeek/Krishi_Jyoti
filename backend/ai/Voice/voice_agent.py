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
            "You are 'MSP Mitra,' an expert AI assistant from Krishi Jyoti. "
            "Your sole purpose is to provide Minimum Support Price (MSP) information based on the data provided below. "
            "You must only use the following data to answer questions. If a crop is not in this data, state that you do not have the information for that crop. "
            "Response Style: Provide answers in plain text only. Do not use any special characters like asterisks or markdown formatting. State the MSP per quintal. "
            "\n"
            "--- MSP Data for 2025-26 ---\n"
            "Paddy (Common): 2369\n"
            "Paddy (Grade 'A'): 2389\n"
            "Jowar (Hybrid): 3699\n"
            "Jowar (Maldandi): 3749\n"
            "Bajra: 2775\n"
            "Ragi: 4886\n"
            "Maize: 2400\n"
            "Arhar: 8000\n"
            "Moong: 8768\n"
            "Urad: 7800\n"
            "Cotton (Medium Staple): 7710\n"
            "Cotton (Long Staple): 8110\n"
            "Groundnut: 7263\n"
            "Sunflower Seed: 7721\n"
            "Soyabean Yellow: 5328\n"
            "Sesamum: 9846\n"
            "Nigerseed: 9537\n"
            "Wheat: 2425\n"
            "Barley: 1980\n"
            "Gram: 5650\n"
            "Masur (Lentil): 6700\n"
            "Rapeseed & mustard: 5950\n"
            "Safflower: 5940\n"
            "Jute: 5650\n"
            "Copra (milling): 11582\n"
            "Copra (ball): 12100\n"
            "--- End of Data ---"
        )
        
        options.agent.speak.provider.type = "deepgram"
        options.agent.speak.provider.model = "aura-asteria-en"
        
        options.agent.greeting = (
            "Hello, I am MSP Mitra from Krishi Jyoti. "
            "You can ask me for the current Minimum Support Price of any major crop."
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

        def send_keep_alive():
            while True:
                time.sleep(5)
                connection.send(str(AgentKeepAlive()))

        keep_alive_thread = threading.Thread(target=send_keep_alive, daemon=True)
        keep_alive_thread.start()

        audio_buffer = bytearray()
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
            nonlocal audio_buffer
            print("✅ Response complete")
            audio_buffer = bytearray()

        def on_conversation_text(self, conversation_text, **kwargs):
            # This filter is a safeguard against repetition.
            if 'History' in str(conversation_text):
                return
                
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

        # This handler now silently ignores History events.
        def on_unhandled(self, unhandled, **kwargs):
            if hasattr(unhandled, 'raw') and '"type":"History"' in str(unhandled.raw):
                return # Silently ignore the message
            # Optionally log other unknown messages if needed for debugging
            # print(f"🤷 Unknown Message: {unhandled}")

        def on_settings_applied(self, settings_applied, **kwargs): pass
        def on_agent_thinking(self, agent_thinking, **kwargs): pass
        def on_close(self, close, **kwargs): pass

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
            while running:
                time.sleep(0.1)
        except KeyboardInterrupt:
            print("\n👋 Stopping voice agent...")
            running = False
            time.sleep(0.5)

        # Cleanup
        try:
            mic_stream.stop_stream()
            mic_stream.close()
            speaker_stream.stop_stream()
            speaker_stream.close()
            audio.terminate()
            connection.finish()
            print("🧹 Cleanup complete")
        except Exception as e:
            print(f"⚠️ Cleanup warning: {e}")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    main()