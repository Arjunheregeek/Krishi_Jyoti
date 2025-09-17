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
    """
    
    def __init__(self, response_callback: Callable = None):
        """
        Initialize the Voice Agent.
        """
        self.response_callback = response_callback
        self.api_key = os.getenv("DEEPGRAM_API_KEY")
        if not self.api_key:
            raise ValueError("DEEPGRAM_API_KEY environment variable is not set")
        
        config = DeepgramClientOptions(
            options={"keepalive": "true", "timeout": 30.0, "verbose": False}
        )
        self.deepgram = DeepgramClient(self.api_key, config)
        self.connection = None
        
        # State management
        self.running = False
        self.audio_buffer = bytearray()
        self._main_loop = None
        self._keep_alive_thread = None
        
    def _setup_connection(self):
        """Setup the Deepgram WebSocket connection."""
        self.connection = self.deepgram.agent.websocket.v("1")
        
        options = SettingsOptions()
        
        # Audio settings
        options.audio.input.encoding = "linear16"
        options.audio.input.sample_rate = 48000
        options.audio.output.encoding = "linear16"
        options.audio.output.sample_rate = 24000
        options.audio.output.container = "none"
        
        # Agent language
        options.agent.language = "en"
        
        # Provider configuration
        options.agent.listen.provider.type = "deepgram"
        options.agent.listen.provider.model = "nova-2"
        options.agent.think.provider.type = "open_ai"
        options.agent.think.provider.model = "gpt-4o-mini"
        options.agent.speak.provider.type = "deepgram"
        options.agent.speak.provider.model = "aura-asteria-en"
        
        # Prompt with embedded MSP Data
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
        
        # Greeting message
        options.agent.greeting = (
            "Hello, I am MSP Mitra from Krishi Jyoti. "
            "You can ask me for the current Minimum Support Price of any major crop."
        )
        
        return options
    
    def _setup_event_handlers(self):
        """Setup all event handlers."""
        agent = self
        
        def on_audio_data(client, data, **kwargs):
            agent.audio_buffer.extend(data)
            if agent.response_callback and agent._main_loop:
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("audio", data), 
                    agent._main_loop
                )
        
        def on_agent_audio_done(client, agent_audio_done, **kwargs):
            if agent.response_callback and agent._main_loop:
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("audio_complete", ""), 
                    agent._main_loop
                )
            agent.audio_buffer = bytearray()
        
        def on_conversation_text(client, conversation_text, **kwargs):
            try:
                # Safeguard filter to ignore History events
                if 'History' in str(conversation_text):
                    return
                
                role = getattr(conversation_text, 'role', 'unknown')
                content = getattr(conversation_text, 'content', str(conversation_text))
                
                if role == 'user':
                    print(f"👤 User: {content}")
                elif role == 'assistant':
                    print(f"🤖 Assistant: {content}")
                    
                if agent.response_callback and agent._main_loop and role in ['user', 'assistant']:
                    asyncio.run_coroutine_threadsafe(
                        agent.response_callback(role, content), 
                        agent._main_loop
                    )
            except Exception as e:
                print(f"⚠️ Error in conversation text handler: {e}")
        
        def on_welcome(client, welcome, **kwargs):
            if agent.response_callback and agent._main_loop:
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("status", "ready"), 
                    agent._main_loop
                )
        
        def on_user_started_speaking(client, user_started_speaking, **kwargs):
            agent.audio_buffer.clear()
            if agent.response_callback and agent._main_loop:
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("status", "listening"), 
                    agent._main_loop
                )
        
        def on_agent_started_speaking(client, agent_started_speaking, **kwargs):
            agent.audio_buffer = bytearray()
            if agent.response_callback and agent._main_loop:
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("status", "speaking"), 
                    agent._main_loop
                )
        
        def on_agent_thinking(client, agent_thinking, **kwargs):
            if agent.response_callback and agent._main_loop:
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("status", "thinking"), 
                    agent._main_loop
                )
        
        def on_error(client, error, **kwargs):
            print(f"❌ Deepgram Error: {error}")
            if agent.response_callback and agent._main_loop:
                asyncio.run_coroutine_threadsafe(
                    agent.response_callback("error", str(error)), 
                    agent._main_loop
                )

        # *** CHANGE 1: Added handler for unhandled events to catch History ***
        def on_unhandled(self, unhandled, **kwargs):
            if hasattr(unhandled, 'raw') and '"type":"History"' in str(unhandled.raw):
                return # Silently ignore History messages
        
        # Register handlers
        self.connection.on(AgentWebSocketEvents.AudioData, on_audio_data)
        self.connection.on(AgentWebSocketEvents.AgentAudioDone, on_agent_audio_done)
        self.connection.on(AgentWebSocketEvents.ConversationText, on_conversation_text)
        self.connection.on(AgentWebSocketEvents.Welcome, on_welcome)
        self.connection.on(AgentWebSocketEvents.UserStartedSpeaking, on_user_started_speaking)
        self.connection.on(AgentWebSocketEvents.AgentThinking, on_agent_thinking)
        self.connection.on(AgentWebSocketEvents.AgentStartedSpeaking, on_agent_started_speaking)
        self.connection.on(AgentWebSocketEvents.Error, on_error)
        self.connection.on(AgentWebSocketEvents.Unhandled, on_unhandled) # Register the new handler
    
    def _keep_alive_worker(self):
        while self.running:
            try:
                time.sleep(5)
                if self.connection and self.running:
                    self.connection.send(str(AgentKeepAlive()))
            except Exception as e:
                print(f"Keep-alive error: {e}")
                break
    
    def start(self):
        if self.running:
            return False
        
        try:
            options = self._setup_connection()
            self._setup_event_handlers()
            
            if not self.connection.start(options):
                print("Failed to start Deepgram connection")
                return False
            
            self.running = True
            
            self._keep_alive_thread = threading.Thread(target=self._keep_alive_worker, daemon=True)
            self._keep_alive_thread.start()
            
            return True
            
        except Exception as e:
            print(f"Error starting voice agent: {e}")
            self.running = False
            return False
    
    def stop(self):
        if not self.running:
            return
        
        self.running = False
        
        try:
            if self.connection:
                self.connection.finish()
        except Exception as e:
            print(f"Error during voice agent cleanup: {e}")
    
    def send_audio(self, audio_data: bytes):
        if self.connection and self.running:
            try:
                self.connection.send(audio_data)
            except Exception as e:
                print(f"Error sending audio: {e}")
    
    def is_running(self) -> bool:
        return self.running