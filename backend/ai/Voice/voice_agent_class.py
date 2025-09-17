import asyncio
import threading
import time
import os
from typing import Callable, Optional
from dotenv import load_dotenv

from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    AgentWebSocketEvents,
    AgentKeepAlive,
)
from deepgram.clients.agent.v1.websocket.options import SettingsOptions

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))


class VoiceAgent:
    """
    Voice Agent class for handling real-time voice interactions using Deepgram.
    Designed to work with WebSocket connections for frontend integration.
    
    This class maintains the same audio format expectations as the frontend:
    - Input: 48kHz, 1 channel, 16-bit PCM (from frontend)
    - Output: 24kHz, 1 channel, 16-bit PCM
    """
    
    def __init__(self, response_callback: Callable = None):
        """
        Initialize the Voice Agent.
        
        Args:
            response_callback: Async callback function that receives (role, content) for responses
        """
        self.response_callback = response_callback
        self.api_key = os.getenv("DEEPGRAM_API_KEY")
        if not self.api_key:
            raise ValueError("DEEPGRAM_API_KEY environment variable is not set")
        
        # Initialize Deepgram client with minimal logging to reduce noise
        config = DeepgramClientOptions(
            options={
                "keepalive": "true",
                "timeout": 30.0,  # Increase timeout to 30 seconds
                "verbose": False,  # Try to disable verbose logging
            }
        )
        self.deepgram = DeepgramClient(self.api_key, config)
        self.connection = None
        
        # State management - matching original voice_agent.py structure
        self.running = False
        self.audio_buffer = bytearray()
        self._main_loop = None
        self._keep_alive_thread = None
        
    def _setup_connection(self):
        """Setup the Deepgram WebSocket connection with simplified configuration."""
        self.connection = self.deepgram.agent.websocket.v("1")
        
        # Configure the Agent with simplified settings
        options = SettingsOptions()
        
        # Audio settings - match frontend's 48kHz format
        options.audio.input.encoding = "linear16"
        options.audio.input.sample_rate = 48000  # Restored to match frontend
        options.audio.output.encoding = "linear16"
        options.audio.output.sample_rate = 24000
        options.audio.output.container = "none"
        
        # Agent language
        options.agent.language = "en"
        
        # Speech-to-Text configuration
        options.agent.listen.provider.type = "deepgram"
        options.agent.listen.provider.model = "nova-2"
        
        # LLM configuration - exact same as original
        options.agent.think.provider.type = "open_ai"
        options.agent.think.provider.model = "gpt-4o-mini"
        
        options.agent.think.prompt = (
            "You are a helpful farming assistant for Krishi Jyoti. "
            "Give practical advice about crops, soil, and farming techniques. "
            "Keep responses short and actionable."
        )
        
        # Text-to-Speech configuration
        options.agent.speak.provider.type = "deepgram"
        options.agent.speak.provider.model = "aura-asteria-en"
        
        # Greeting message - exact same as original
        options.agent.greeting = (
            "Hello! I'm your Krishi Jyoti farming assistant. "
            "How can I help with your farm today?"
        )
        
        return options
    
    def _setup_event_handlers(self):
        """Setup all event handlers matching the original voice_agent.py structure."""
        # Capture the VoiceAgent instance to avoid confusion with Deepgram client 'self'
        agent = self
        
        def on_audio_data(client, data, **kwargs):
            """Handle incoming audio data from Deepgram - send to WebSocket callback."""
            agent.audio_buffer.extend(data)
            if agent.response_callback and agent._main_loop:
                # Schedule the callback in the main event loop
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("audio", data), 
                    agent._main_loop
                )
        
        def on_agent_audio_done(client, agent_audio_done, **kwargs):
            """Handle completion of agent audio response - signal completion to WebSocket immediately."""
            if agent.response_callback and agent._main_loop:
                # Signal that audio is complete so WebSocket can send WAV file immediately
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("audio_complete", ""), 
                    agent._main_loop
                )
            agent.audio_buffer = bytearray()
        
        def on_conversation_text(client, conversation_text, **kwargs):
            """Handle conversation text updates - skip History messages to prevent delays."""
            try:
                # Check if this is a History message and skip it entirely
                raw_content = str(conversation_text)
                if 'History' in raw_content:
                    return  # Skip History messages immediately
                    
                role = getattr(conversation_text, 'role', 'unknown')
                content = getattr(conversation_text, 'content', str(conversation_text))
                
                # Only process real conversation messages
                if role == 'user':
                    print(f"👤 User: {content}")
                elif role == 'assistant':
                    print(f"🤖 Assistant: {content}")
                    
                # Send to WebSocket callback only for real messages
                if agent.response_callback and agent._main_loop and role in ['user', 'assistant']:
                    asyncio.run_coroutine_threadsafe(
                        agent.response_callback(role, content), 
                        agent._main_loop
                    )
            except Exception as e:
                print(f"⚠️ Error in conversation text handler: {e}")
        
        def on_welcome(client, welcome, **kwargs):
            """Handle welcome message."""
            if agent.response_callback and agent._main_loop:
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("status", "ready"), 
                    agent._main_loop
                )
        
        def on_user_started_speaking(client, user_started_speaking, **kwargs):
            """Handle user started speaking event."""
            agent.audio_buffer.clear()
            if agent.response_callback and agent._main_loop:
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("status", "listening"), 
                    agent._main_loop
                )
        
        def on_inject_user_message(client, inject_user_message, **kwargs):
            """Handle injected user message event."""
            try:
                content = getattr(inject_user_message, 'content', str(inject_user_message))
                if agent.response_callback and agent._main_loop:
                    asyncio.run_coroutine_threadsafe(
                        agent.response_callback("user", content), 
                        agent._main_loop
                    )
            except Exception as e:
                print(f"⚠️ Error in inject user message handler: {e}")
        
        def on_inject_agent_message(client, inject_agent_message, **kwargs):
            """Handle injected agent message event."""
            try:
                content = getattr(inject_agent_message, 'content', str(inject_agent_message))
                if agent.response_callback and agent._main_loop:
                    asyncio.run_coroutine_threadsafe(
                        agent.response_callback("assistant", content), 
                        agent._main_loop
                    )
            except Exception as e:
                print(f"⚠️ Error in inject agent message handler: {e}")
        
        def on_agent_started_speaking(client, agent_started_speaking, **kwargs):
            """Handle agent started speaking event."""
            agent.audio_buffer = bytearray()
            if agent.response_callback and agent._main_loop:
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("status", "speaking"), 
                    agent._main_loop
                )
        
        def on_history(client, history, **kwargs):
            """Handle history events - silently ignore to prevent delays."""
            pass
        
        def on_agent_thinking(client, agent_thinking, **kwargs):
            """Handle agent thinking event."""
            if agent.response_callback and agent._main_loop:
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("status", "thinking"), 
                    agent._main_loop
                )
        
        def on_error(client, error, **kwargs):
            """Handle errors."""
            print(f"❌ Deepgram Error: {error}")
            if agent.response_callback and agent._main_loop:
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("error", str(error)), 
                    agent._main_loop
                )
        
        # Placeholder handlers - silently handle events
        def on_settings_applied(client, settings_applied, **kwargs): 
            pass
        def on_close(client, close, **kwargs): 
            pass
        def on_unhandled(client, unhandled, **kwargs): 
            """Handle unhandled events - efficiently filter out History messages that cause delays."""
            try:
                # Check if this is a History message and skip all processing
                if hasattr(unhandled, 'raw'):
                    if '"type":"History"' in str(unhandled.raw):
                        return  # Skip History messages immediately
                # Skip all other unhandled events to prevent delays
            except:
                pass
        
        # Register all handlers - exact same order as original
        self.connection.on(AgentWebSocketEvents.AudioData, on_audio_data)
        self.connection.on(AgentWebSocketEvents.AgentAudioDone, on_agent_audio_done)
        self.connection.on(AgentWebSocketEvents.ConversationText, on_conversation_text)
        self.connection.on(AgentWebSocketEvents.Welcome, on_welcome)
        self.connection.on(AgentWebSocketEvents.SettingsApplied, on_settings_applied)
        self.connection.on(AgentWebSocketEvents.UserStartedSpeaking, on_user_started_speaking)
        self.connection.on(AgentWebSocketEvents.AgentThinking, on_agent_thinking)
        self.connection.on(AgentWebSocketEvents.AgentStartedSpeaking, on_agent_started_speaking)
        self.connection.on(AgentWebSocketEvents.InjectUserMessage, on_inject_user_message)
        self.connection.on(AgentWebSocketEvents.InjectAgentMessage, on_inject_agent_message)
        self.connection.on(AgentWebSocketEvents.Close, on_close)
        self.connection.on(AgentWebSocketEvents.Error, on_error)
        self.connection.on(AgentWebSocketEvents.Unhandled, on_unhandled)
        
        # Try to handle History events if they exist
        try:
            # Check if History event exists and register it
            if hasattr(AgentWebSocketEvents, 'History'):
                self.connection.on(AgentWebSocketEvents.History, on_history)
        except Exception:
            pass
    
    def _keep_alive_worker(self):
        """Keep-alive worker thread - same logic as original."""
        while self.running:
            try:
                time.sleep(5)
                if self.connection and self.running:
                    self.connection.send(str(AgentKeepAlive()))
            except Exception as e:
                print(f"Keep-alive error: {e}")
                break
    
    def start(self):
        """Start the voice agent - same logic as original."""
        if self.running:
            return False
        
        try:
            # Setup connection and handlers
            options = self._setup_connection()
            self._setup_event_handlers()
            
            # Start the connection - same as original
            if not self.connection.start(options):
                print("Failed to start Deepgram connection")
                return False
            
            self.running = True
            
            # Start keep-alive thread - same as original
            self._keep_alive_thread = threading.Thread(target=self._keep_alive_worker, daemon=True)
            self._keep_alive_thread.start()
            
            return True
            
        except Exception as e:
            print(f"Error starting voice agent: {e}")
            import traceback
            traceback.print_exc()
            self.running = False
            return False
    
    def stop(self):
        """Stop the voice agent and cleanup resources - same as original."""
        if not self.running:
            return
        
        self.running = False
        
        try:
            if self.connection:
                self.connection.finish()
        except Exception as e:
            print(f"Error during voice agent cleanup: {e}")
    
    def send_audio(self, audio_data: bytes):
        """
        Send audio data to Deepgram for processing.
        Expects 48kHz, 1 channel, 16-bit PCM (updated to match frontend)
        
        Args:
            audio_data: Raw audio bytes to send (must be 48kHz mono PCM)
        """
        if self.connection and self.running:
            try:
                # Send raw audio data directly
                self.connection.send(audio_data)
            except Exception as e:
                print(f"Error sending audio: {e}")
        else:
            print("[DEBUG] Cannot send audio: connection not active")
    
    def is_running(self) -> bool:
        """Check if the voice agent is currently running."""
        return self.running