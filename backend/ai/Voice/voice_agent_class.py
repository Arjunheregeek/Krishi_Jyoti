import os
import time
import threading
from dotenv import load_dotenv
from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    AgentWebSocketEvents,
    AgentKeepAlive,
)
from deepgram.clients.agent.v1.websocket.options import SettingsOptions

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

class VoiceAgent:
    """
    WebSocket-compatible VoiceAgent class for browser integration
    """
    def __init__(self, on_response_callback):
        """
        Initialize VoiceAgent with a callback for responses
        
        Args:
            on_response_callback: Async function that handles responses (role, content)
        """
        api_key = os.getenv("DEEPGRAM_API_KEY")
        if not api_key:
            raise ValueError("DEEPGRAM_API_KEY environment variable is not set")
        
        self.on_response_callback = on_response_callback
        self.running = False
        self._main_loop = None
        
        # Try to capture the main event loop
        try:
            import asyncio
            self._main_loop = asyncio.get_running_loop()
            print("[VoiceAgent] Captured main event loop")
        except RuntimeError:
            print("[VoiceAgent] No running event loop found during init")
        
        # Initialize Deepgram client
        config = DeepgramClientOptions(options={"keepalive": "true"})
        self.deepgram = DeepgramClient(api_key, config)
        self.connection = self.deepgram.agent.websocket.v("1")
        
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
        
        self.options = options
        self._setup_event_handlers()
    
    def _setup_event_handlers(self):
        """Setup event handlers for Deepgram Agent WebSocket"""
        
        def on_conversation_text(connection, conversation_text, **kwargs):
            try:
                role = getattr(conversation_text, 'role', 'unknown')
                content = getattr(conversation_text, 'content', str(conversation_text))
                
                # Call the callback with role and content
                if self.on_response_callback:
                    # Note: This will be called from a sync context, but the callback is async
                    # The WebSocket handler will need to handle this properly
                    import asyncio
                    try:
                        loop = asyncio.get_event_loop()
                        loop.create_task(self.on_response_callback(role, content))
                    except RuntimeError:
                        # If no event loop is running, we'll need to handle this differently
                        print(f"[VoiceAgent] {role}: {content}")
                        
            except Exception as e:
                print(f"Error in conversation text handler: {e}")
        
        def on_audio_data(connection, data, **kwargs):
            """Handle audio data from the agent (TTS output)"""
            try:
                print(f"[VoiceAgent] Received audio data: {len(data)} bytes")
                # Send audio data to the frontend for playback
                if self.on_response_callback and self._main_loop:
                    # Use call_soon_threadsafe to schedule the callback
                    import asyncio
                    
                    async def send_audio_callback():
                        try:
                            await self.on_response_callback("audio", data)
                            print(f"[VoiceAgent] Audio data sent to callback successfully")
                        except Exception as e:
                            print(f"[VoiceAgent] Error in audio callback: {e}")
                    
                    # Schedule the callback in the main event loop
                    self._main_loop.call_soon_threadsafe(
                        lambda: asyncio.create_task(send_audio_callback())
                    )
                else:
                    print(f"[VoiceAgent] No callback or event loop available for audio data")
            except Exception as e:
                print(f"Error in audio data handler: {e}")
        
        def on_error(connection, error, **kwargs):
            print(f"[VoiceAgent] Error: {error}")
        
        def on_welcome(connection, welcome, **kwargs):
            print("[VoiceAgent] Welcome received - agent is ready")
        
        def on_user_started_speaking(connection, user_started_speaking, **kwargs):
            print("[VoiceAgent] User started speaking")
        
        def on_agent_started_speaking(connection, agent_started_speaking, **kwargs):
            print("[VoiceAgent] Agent started speaking")
        
        def on_agent_audio_done(connection, agent_audio_done, **kwargs):
            print("[VoiceAgent] Agent finished speaking")
        
        # Register all event handlers
        self.connection.on(AgentWebSocketEvents.ConversationText, on_conversation_text)
        self.connection.on(AgentWebSocketEvents.AudioData, on_audio_data)
        self.connection.on(AgentWebSocketEvents.Error, on_error)
        self.connection.on(AgentWebSocketEvents.Welcome, on_welcome)
        self.connection.on(AgentWebSocketEvents.UserStartedSpeaking, on_user_started_speaking)
        self.connection.on(AgentWebSocketEvents.AgentStartedSpeaking, on_agent_started_speaking)
        self.connection.on(AgentWebSocketEvents.AgentAudioDone, on_agent_audio_done)
    
    def start(self):
        """Start the Deepgram Agent WebSocket connection"""
        try:
            print("[VoiceAgent] Connecting to Deepgram Agent API...")
            print("[VoiceAgent] Note: SDK internally connects to wss://agent.deepgram.com/v1/agent/converse")
            
            if not self.connection.start(self.options):
                raise RuntimeError("Failed to start Deepgram connection")
            
            self.running = True
            
            # Start keep-alive thread
            def send_keep_alive():
                while self.running:
                    try:
                        time.sleep(5)
                        if self.running:
                            self.connection.send(str(AgentKeepAlive()))
                    except Exception as e:
                        print(f"Keep-alive error: {e}")
                        break
            
            self.keep_alive_thread = threading.Thread(target=send_keep_alive, daemon=True)
            self.keep_alive_thread.start()
            
            print("[VoiceAgent] Started successfully")
            return True
            
        except Exception as e:
            print(f"[VoiceAgent] Failed to start: {e}")
            return False
    
    def send_audio(self, audio_data: bytes):
        """Send audio data to the Deepgram Agent"""
        try:
            if self.running and self.connection:
                self.connection.send(audio_data)
        except Exception as e:
            print(f"[VoiceAgent] Error sending audio: {e}")
    
    def stop(self):
        """Stop the Deepgram Agent WebSocket connection"""
        try:
            self.running = False
            if self.connection:
                self.connection.finish()
            print("[VoiceAgent] Stopped successfully")
        except Exception as e:
            print(f"[VoiceAgent] Error stopping: {e}")