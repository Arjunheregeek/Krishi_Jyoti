import asyncio
import sys
import os
import json
import base64
import wave
import io

# Add parent directories to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

# Import the VoiceAgent - note the capital V in Voice folder
try:
    from ai.Voice.voice_agent_class import VoiceAgent
except ImportError as e:
    print(f"Failed to import VoiceAgent: {e}")
    # Create a dummy VoiceAgent for now to prevent import errors
    class VoiceAgent:
        def __init__(self, callback=None):
            self.callback = callback
        def start(self):
            return False
        def stop(self):
            pass
        def send_audio(self, data):
            pass
        def is_running(self):
            return False

router = APIRouter()

def create_wav_header(sample_rate, bits_per_sample, channels, data_size):
    """Creates a valid WAV header for the given audio data parameters."""
    header_io = io.BytesIO()
    with wave.open(header_io, 'wb') as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(bits_per_sample // 8)
        wf.setframerate(sample_rate)
        wf.writeframes(b'')  # Write empty frames to setup header
    
    header_bytes = header_io.getvalue()
    # RIFF chunk size (filesize - 8)
    header_bytes = header_bytes[:4] + (data_size + 36).to_bytes(4, 'little') + header_bytes[8:]
    # data sub-chunk size (filesize - 44)
    header_bytes = header_bytes[:40] + data_size.to_bytes(4, 'little')
    
    return header_bytes

@router.websocket("/ws/voice")
async def voice_ws(websocket: WebSocket):
    """
    WebSocket handler for real-time voice streaming.
    Buffers audio chunks and sends complete WAV files to frontend.
    """
    await websocket.accept()
    print("✅ Voice WebSocket client connected")

    # Audio buffer for collecting Deepgram audio chunks
    audio_buffer = bytearray()

    # Define a callback to send responses back to the client
    async def on_response(role, content):
        nonlocal audio_buffer
        try:
            if role == "assistant":
                print(f"🤖 Assistant: {content}")
                await websocket.send_json({
                    "type": "agent_response", 
                    "text": content,
                    "timestamp": asyncio.get_event_loop().time()
                })
            elif role == "user":
                print(f"👤 User: {content}")
                await websocket.send_json({
                    "type": "partial_transcript", 
                    "text": content,
                    "timestamp": asyncio.get_event_loop().time()
                })
            elif role == "audio":
                # Buffer audio chunks instead of sending immediately
                audio_buffer.extend(content)
            elif role == "audio_complete":
                # Send complete WAV file when agent finishes speaking
                if audio_buffer:
                    # Create WAV header for the complete audio buffer
                    wav_header = create_wav_header(
                        sample_rate=24000,
                        bits_per_sample=16,
                        channels=1,
                        data_size=len(audio_buffer)
                    )
                    
                    full_wav_data = wav_header + audio_buffer
                    audio_b64 = base64.b64encode(full_wav_data).decode('utf-8')
                    
                    await websocket.send_json({
                        "type": "agent_audio_wav", 
                        "audio_data": audio_b64,
                        "timestamp": asyncio.get_event_loop().time()
                    })
                    
                    audio_buffer.clear()
            elif role == "status":
                # Send status updates only for important events
                if content in ["listening", "ready"]:
                    await websocket.send_json({
                        "type": "status", 
                        "status": content,
                        "timestamp": asyncio.get_event_loop().time()
                    })
        except Exception as e:
            print(f"❌ Error sending WebSocket response: {e}")

    # Initialize the VoiceAgent with the callback
    agent = VoiceAgent(on_response)
    
    # Set the current event loop for the agent
    try:
        current_loop = asyncio.get_running_loop()
        agent._main_loop = current_loop
    except RuntimeError:
        print("Could not get current event loop")

    try:
        # Start the Deepgram Agent
        success = agent.start()
        if not success:
            await websocket.send_json({
                "type": "error", 
                "message": "Failed to start voice agent"
            })
            await websocket.close(code=1011)
            return
        
        print("🎤 Voice agent ready for queries")

        # Stream audio data from the client to Deepgram
        while agent.is_running():
            try:
                # Receive audio data from frontend
                message = await websocket.receive()
                
                if message["type"] == "websocket.receive":
                    if "bytes" in message:
                        # Handle binary audio data - send to Deepgram without logging
                        audio_data = message["bytes"]
                        agent.send_audio(audio_data)
                    elif "text" in message:
                        # Handle text messages (commands, etc.)
                        try:
                            text_message = json.loads(message["text"])
                            if text_message.get("type") == "command":
                                command = text_message.get("command")
                                if command == "stop":
                                    print("🛑 Stop command received")
                                    break
                        except json.JSONDecodeError:
                            print("⚠️ Received invalid JSON message")
                elif message["type"] == "websocket.disconnect":
                    print("👋 WebSocket client disconnected")
                    break
                            
            except Exception as e:
                print(f"⚠️ Error receiving WebSocket data: {e}")
                break

    except WebSocketDisconnect:
        print("👋 Client disconnected")
    except Exception as e:
        print(f"❌ Voice WebSocket error: {e}")
    finally:
        # Stop the Deepgram Agent
        try:
            agent.stop()
            print("🧹 Voice agent stopped")
        except Exception as e:
            print(f"⚠️ Error stopping voice agent: {e}")
        
        # Close WebSocket if still open
        try:
            await websocket.close()
        except Exception:
            pass