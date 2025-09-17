from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from ai.Voice.voice_agent_class import VoiceAgent

router = APIRouter()

@router.websocket("/ws/voice")
async def voice_ws(websocket: WebSocket):
    """
    WebSocket handler for real-time voice streaming.
    """
    await websocket.accept()
    print("[voice_ws] WebSocket client connected")

    # Define a callback to send responses back to the client
    async def on_response(role, content):
        if role == "assistant":
            print(f"[voice_ws] Sending agent response: {content[:100]}...")
            await websocket.send_json({"type": "agent_response", "text": content})
        elif role == "user":
            print(f"[voice_ws] Sending partial transcript: {content}")
            await websocket.send_json({"type": "partial_transcript", "text": content})
        elif role == "audio":
            # Send audio data as binary
            print(f"[voice_ws] Sending audio data: {len(content)} bytes")
            await websocket.send_json({"type": "agent_audio", "audio_data": list(content)})

    # Initialize the VoiceAgent with the callback
    agent = VoiceAgent(on_response)
    
    # Capture the current event loop for the agent
    import asyncio
    try:
        current_loop = asyncio.get_running_loop()
        agent._main_loop = current_loop
        print("[voice_ws] Set main event loop for agent")
    except RuntimeError:
        print("[voice_ws] Could not get current event loop")

    try:
        # Start the Deepgram Agent
        agent.start()
        print("[voice_ws] Deepgram Agent started")

        # Stream audio data from the client to Deepgram
        while True:
            try:
                data = await websocket.receive_bytes()
                agent.send_audio(data)
            except KeyError:
                print("[voice_ws] Received non-binary message")
                await websocket.close(code=1003)  # Close with an appropriate error code
                return

    except WebSocketDisconnect:
        print("[voice_ws] WebSocket disconnected")
    finally:
        # Stop the Deepgram Agent
        agent.stop()
        print("[voice_ws] Deepgram Agent stopped")