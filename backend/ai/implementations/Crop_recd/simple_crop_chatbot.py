import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv
import pickle
import numpy as np
import json
import re

# --- Project Root Setup ---
project_root = Path(__file__).resolve()
while not (project_root / "backend").exists() and project_root != project_root.parent:
    project_root = project_root.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
from backend.api.Wheather.demo_weather import get_weather
from cerebras.cloud.sdk import Cerebras

# --- Logging Setup ---
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("cerebras.cloud.sdk").setLevel(logging.WARNING)
load_dotenv()

class CropChatBot:
    """A modular, conversational chatbot for crop recommendation."""

    def __init__(self):
        """Initializes the chatbot, loads the ML model, and sets initial state."""
        self.client = Cerebras(api_key=os.environ.get("CEREBRAS_API_KEY"))
        
        # --- State Management ---
        self.state = "GATHERING_INFO"
        self.collected_data = {}
        self.conversation_history = []

        # --- PROMPT 1: For Conversational Data Gathering ---
        self.system_prompt_gather = (
            "You are 'Krishi Mitra,' a friendly AI assistant. Your ONLY job is to have a natural, step-by-step conversation with a farmer to collect data for a crop recommendation. "
            "Follow these steps precisely:\n"
            "1. Greet the user and ask for their location (city or district).\n"
            "2. After getting the location, ask for the Nitrogen (N) value. Tell the user they can say 'skip' if they don't know.\n"
            "3. After their response, ask for the Phosphorus (P) value.\n"
            "4. After their response, ask for the Potassium (K) value.\n"
            "5. After their response, ask for the soil's pH value.\n"
            "6. After their response, ask what crop they grew in the same field last season.\n"
            "7. After they answer the final question, your ONLY response must be the special signal: [DATA_COLLECTION_COMPLETE]\n\n"
            "**RULES:**\n"
            "- Ask ONLY ONE question at a time.\n"
            "- Be polite and conversational.\n"
            "- **Exception Rule:** If the user says something like 'I don't know anything else' or 'that's all I know', you must adapt. Acknowledge their response (e.g., 'No problem at all.'), then ask for all remaining soil values in a single, optional question (e.g., 'If you happen to know the values for Phosphorus, Potassium, or pH, you can provide them now. Otherwise , i will do my best to find the relevant info '). In your very next turn after that, you must respond with '[DATA_COLLECTION_COMPLETE]'.\n"
            "- Do not provide a crop recommendation yourself. Your job is only to gather information."
        )

        # --- PROMPT 2: For Formatting Data for the ML Model ---
        self.system_prompt_format = (
            "You are a data processing AI. Your task is to analyze a conversation and extract specific agricultural data into a JSON format. "
            "From the conversation history, extract the following values: location, N, P, K, pH, and previous_crop. "
            "If the user did not provide a value for N, P, K, or pH, you MUST make an educated guess for the missing values based on the provided location and, most importantly, the previously grown crop. "
            "Respond ONLY with a single, clean JSON object with the keys: \"location\", \"N\", \"P\", \"K\", \"pH\", \"temperature\", \"humidity\", \"rainfall\", \"previous_crop\"."
        )

    def add_to_history(self, role, content):
        """Adds a message to the conversation history."""
        self.conversation_history.append({"role": role, "content": content})

    def _format_data_for_model(self):
        """Uses an LLM to parse the conversation and format data for the ML model."""
        print("🤖 Formatting data for ML model...")
        
        # Add weather data to the history for context
        # Find the first user message that is likely the location
        location = "Unknown"
        if len(self.conversation_history) > 1 and self.conversation_history[0]['role'] == 'assistant':
             location = self.conversation_history[1]['content']

        weather = get_weather(location)
        if weather:
             self.add_to_history(
                 "system", 
                 f"Weather context for {weather.get('name')}: Temperature is {weather.get('main', {}).get('temp')}C, Humidity is {weather.get('main', {}).get('humidity')}%, Rainfall is approximately {weather.get('rain', {}).get('1h', 0) * 730 / 12:.2f}mm/month."
            )

        messages = [{"role": "system", "content": self.system_prompt_format}]
        messages.extend(self.conversation_history)
        
        response = self.client.chat.completions.create(
            messages=messages,
            model="llama-4-scout-17b-16e-instruct",
            temperature=0.2,
            max_tokens=400
        )
        
        response_content = response.choices[0].message.content
        print(f"Formatted Data (from LLM):\n{response_content}")

        # A robust way to parse JSON that might be wrapped in text or markdown
        try:
            json_str = response_content[response_content.find('{'):response_content.rfind('}') + 1]
            self.collected_data = json.loads(json_str)
        except (json.JSONDecodeError, IndexError):
            print("🚨 Error: Could not parse JSON from formatting LLM. Cannot proceed.")
            self.collected_data = {} # Reset on failure

    def get_response(self, user_message: str):
        """Manages the conversational flow and provides a response."""
        self.add_to_history("user", user_message)

        if self.state == "GATHERING_INFO":
            messages = [{"role": "system", "content": self.system_prompt_gather}]
            messages.extend(self.conversation_history)

            print("🧠 Gathering information...")
            response = self.client.chat.completions.create(
                messages=messages,
                model="llama-4-scout-17b-16e-instruct",
                temperature=0.7,
                max_tokens=600
            )
            assistant_response = response.choices[0].message.content

            self.add_to_history("assistant", assistant_response)

            if "[DATA_COLLECTION_COMPLETE]" in assistant_response:
                self.state = "FORMATTING_DATA"
                self._format_data_for_model()
                # Here you would proceed to call the ML model with self.collected_data
                # For now, we'll just indicate the process is complete.
                return "Thank you. I have all the information needed. Please wait while I process your recommendation."
            else:
                return assistant_response
        
        return "I have finished collecting data. The next step would be prediction."

    def start_chat(self):
        """Starts the CLI chat interface."""
        print("🌾 Crop Recommendation ChatBot")
        print("=" * 50)
        print("I will ask a few questions to provide the best crop recommendation.")
        print("Type 'quit', 'exit', or 'bye' to end the conversation.")
        print("=" * 50)

        # Start the conversation
        initial_response = self.get_response("Let's begin.")
        print(f"\n🤖 Assistant: {initial_response}")

        while True:
            try:
                user_input = input("\n👤 You: ").strip()
                if user_input.lower() in ['quit', 'exit', 'bye', 'q']:
                    print("\n👋 Thank you for using Krishi Mitra!")
                    break
                if not user_input:
                    continue

                print("\n🤖 Assistant: ", end="", flush=True)
                response = self.get_response(user_input)
                print(response)

                if self.state == "FORMATTING_DATA":
                    print("\n--- To start a new recommendation, please restart the script. ---")
                    break

            except (KeyboardInterrupt, EOFError):
                print("\n\n👋 Goodbye!")
                break

def main():
    """Main function to run the chatbot"""
    try:
        if not os.environ.get("CEREBRAS_API_KEY"):
            print("❌ Error: CEREBRAS_API_KEY not found in environment variables")
            return
        chatbot = CropChatBot()
        chatbot.start_chat()
    except Exception as e:
        print(f"❌ Failed to start chatbot: {str(e)}")

if __name__ == "__main__":
    main()

