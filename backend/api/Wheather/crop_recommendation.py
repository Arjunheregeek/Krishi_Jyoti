import os
import sys
import logging
from pathlib import Path
import json
import pickle
import numpy as np
import re
from datetime import datetime

# --- Robust Project Root Setup ---
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

# Ensure this points to your most capable weather function
from .wheatherapi import get_agricultural_weather

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logging.getLogger("httpx").setLevel(logging.WARNING)
load_dotenv(project_root / '.env')


class CropChatBot:
    """
    ## FINAL VERSION ##
    A robust, stateful Crop Recommendation ChatBot with an LLM-powered data pipeline,
    API failure fallback, and a final validation layer to ensure recommendations are logical.
    This version does not use hardcoded average values.
    """

    def __init__(self):
        """Initializes the chatbot, loads the ML model, and sets up state."""
        print("Initializing Krishi Mitra...")
        self.llm_client = Cerebras(api_key=os.environ.get("CEREBRAS_API_KEY_2"))

        # Corrected file path for the ML model
        model_path = project_root.parent /"ml" / "models" / "crop_recommendation_model.pkl"
        try:
            with open(model_path, 'rb') as file:
                self.model = pickle.load(file)
            print("✅ Crop recommendation model loaded successfully!")
        except FileNotFoundError:
            print(f"🚨 FATAL ERROR: Model file not found at {model_path}.")
            exit()

        self.conversation_state = {}
        self.system_prompt = (
            "You are 'Krishi Mitra', an expert AI assistant for Indian farmers. "
            "You recommend the best crops based on soil, weather, and user needs. "
            "Always explain your reasoning in simple, clear language. Be friendly and supportive."
        )

    # --- Core LLM-Powered Data Functions ---

    def llm_estimate_weather_and_soil(self, city):
        """Fallback: Estimates all model inputs if the Weather API fails."""
        current_date = datetime.now().strftime("%B %d, %Y")
        prompt = (
            f"You are an expert agri-scientist. It is {current_date}. "
            f"For '{city}, India', our weather API is down. Please estimate typical values for: "
            f"N, P, K (kg/ha), soil pH, temperature (°C), humidity (%), and weekly rainfall (mm). "
            "Respond ONLY with a valid JSON object: "
            "{\"N\": v, \"P\": v, \"K\": v, \"pH\": v, \"temperature\": v, \"humidity\": v, \"rainfall\": v}"
        )
        response = self.llm_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}], model="llama-4-scout-17b-16e-instruct", temperature=0.4
        )
        raw_response_text = response.choices[0].message.content
        try:
            json_match = re.search(r'\{.*\}', raw_response_text, re.DOTALL)
            return json.loads(json_match.group(0)) if json_match else None
        except Exception:
            logging.error(f"LLM estimation fallback failed for {city}. Raw response: '{raw_response_text}'")
            return None

    def llm_parse_weather_and_soil(self, city, weather_data):
        """Primary: Estimates soil and parses real weather data."""
        prompt = (
            f"For {city}, using this agricultural weather data: {json.dumps(weather_data)}\n"
            "1. Estimate typical soil nutrients (N, P, K, pH).\n"
            "2. Extract temperature and humidity from 'current_conditions'.\n"
            "3. Use 'weekly_outlook.total_precipitation' for rainfall.\n"
            "Respond ONLY with a JSON object: "
            '{"N": v, "P": v, "K": v, "pH": v, "temperature": v, "humidity": v, "rainfall": v}'
        )
        response = self.llm_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert agri-scientist."},
                {"role": "user", "content": prompt}
            ], model="llama-4-scout-17b-16e-instruct", temperature=0.3
        )
        raw_response_text = response.choices[0].message.content
        try:
            json_match = re.search(r'\{.*\}', raw_response_text, re.DOTALL)
            return json.loads(json_match.group(0)) if json_match else None
        except Exception:
            logging.error(f"LLM parsing failed for {city}. Raw response: '{raw_response_text}'")
            return None

    # --- Intent, Validation, and Enhancement Functions ---

    def classify_intent(self, user_message):
        """Acts as a router to classify user intent."""
        # This function remains the same as before
        context = f"The user has already asked about the location: {self.conversation_state['city']}." if self.conversation_state.get('city') else ""
        prompt = (
            f"Classify user intent. Context: '{context}'.\nUser message: '{user_message}'\n\n"
            "Intents: 'greeting', 'new_crop_recommendation', 'follow_up_recommendation', 'general_query'.\n"
            "If intent is 'new_crop_recommendation', extract 'location'. If 'follow_up_recommendation', extract 'crop'.\n"
            "Respond ONLY with JSON: {\"intent\": \"...\", \"location\": \"...\", \"crop\": \"...\"}"
        )
        response = self.llm_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}], model="llama-4-scout-17b-16e-instruct", temperature=0.1, max_tokens=150
        )
        try:
            return json.loads(response.choices[0].message.content)
        except Exception:
            return {"intent": "general_query", "location": None, "crop": None}

    def validate_recommendations(self, city, top_crops_list):
        """Validation Layer: Checks if ML model's suggestions are geographically logical."""
        prompt = (
            f"You are an expert agronomist. For '{city}, India', an ML model suggested: {top_crops_list}. "
            "Is each crop 'Suitable' or 'Unsuitable' for that climate? "
            "Respond ONLY with a JSON object. Example: {\"wheat\": \"Suitable\", \"papaya\": \"Unsuitable\"}"
        )
        response = self.llm_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}], model="llama-4-scout-17b-16e-instruct", temperature=0.0
        )
        try:
            results = json.loads(response.choices[0].message.content)
            return [crop for crop, status in results.items() if status.lower() == 'suitable']
        except Exception:
            logging.warning(f"Validation step failed for {city}. Proceeding with ML model output.")
            return top_crops_list # Failsafe: if validation breaks, trust the model

    def llm_enhance(self, user_input, top_crops_list, details):
        """Creates the final user-facing report."""
        # This function remains the same as the improved version
        prompt = (
            f"A farmer in {details.get('city', 'this area')} asked: '{user_input}'\n"
            f"Our top recommendations are: {', '.join(top_crops_list)}.\n"
            f"Data summary: {json.dumps(details, indent=2)}\n\n"
            "As 'Krishi Mitra', please write a friendly, structured report with:\n"
            "1. A warm greeting.\n"
            f"2. A clear explanation for the #1 crop: {top_crops_list[0]}.\n"
            "3. The other crops as good alternatives.\n"
            "4. An 'Actionable Advisory' section if farm risk data is available.\n"
            "5. A friendly tip."
        )
        response = self.llm_client.chat.completions.create(
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": prompt}
            ], model="llama-4-scout-17b-16e-instruct", temperature=0.7, max_tokens=700
        )
        return response.choices[0].message.content

    # --- Main Logic ---

    def get_model_input(self, model_input_dict):
        """Prepares the NumPy array for the ML model."""
        feature_order = ["N", "P", "K", "temperature", "humidity", "pH", "rainfall"]
        ordered_values = [model_input_dict[feature] for feature in feature_order]
        return np.array([ordered_values])

    def get_response(self, user_message):
        """Main response generator with integrated API fallback and validation."""
        classified_data = self.classify_intent(user_message)
        intent = classified_data.get("intent")

        if intent == "greeting":
            return "Hello! How can I help you with your farm planning today?"

        elif intent == "new_crop_recommendation":
            try:
                city = classified_data.get("location")
                if not city or city.lower() == 'unknown':
                    return "Of course, I can help. Please tell me your location (e.g., 'what to grow in Pune?')."

                logging.info(f"Executing new recommendation for: {city}")
                
                # Step 1: Try to get real data from the Weather API
                agri_weather = get_agricultural_weather(city=city)
                details = {}
                model_input_data = None
                
                if "error" in agri_weather:
                    logging.warning(f"Weather API failed for {city}. Using LLM estimation as fallback.")
                    model_input_data = self.llm_estimate_weather_and_soil(city)
                    details = {"city": city, "data_source": "LLM Estimation", **(model_input_data or {})}
                else:
                    logging.info(f"Weather API successful for {city}.")
                    model_input_data = self.llm_parse_weather_and_soil(city, agri_weather)
                    details = {"city": city, "data_source": "API", **(model_input_data or {}), **agri_weather}

                if model_input_data is None:
                    return "I'm sorry, I'm having trouble gathering the necessary data for your location. Please try again later."
                
                # Step 2: Get Top 3 Predictions from ML Model
                model_input_arr = self.get_model_input(model_input_data)
                probabilities = self.model.predict_proba(model_input_arr)[0]
                crop_probs = sorted(zip(self.model.classes_, probabilities), key=lambda x: x[1], reverse=True)
                ml_top_3_crops = [crop for crop, prob in crop_probs[:3]]

                # Step 3: Validate the Recommendations
                suitable_crops = self.validate_recommendations(city, ml_top_3_crops)

                if not suitable_crops:
                    logging.warning(f"ML recommendations {ml_top_3_crops} rejected for {city}. Using LLM as final fallback.")
                    # Handle case where all ML suggestions are unsuitable
                    return self.llm_enhance(user_message, [], details) # Let llm_enhance handle this scenario

                self.conversation_state = details
                return self.llm_enhance(user_message, suitable_crops, details)

            except Exception as e:
                logging.error(f"Critical error in 'new_crop_recommendation': {e}", exc_info=True)
                return f"❌ I encountered an unexpected error. Please try again."

        # (Other intents like 'follow_up_recommendation' and 'general_query' would go here)
        else:
            return "I'm here to help with your farming questions! Ask me about crop recommendations."

    def start_chat(self):
        """Starts the interactive command-line interface."""
        # This function remains the same
        print("\n🌾 Krishi Mitra Crop Recommendation ChatBot")
        print("=" * 50)
        print("Ask me for a crop recommendation (e.g., 'What should I plant in Aurangabad?')")
        print("Type 'quit' or 'exit' to end.")
        print("=" * 50)
        while True:
            try:
                user_input = input("\n👤 You: ").strip()
                if user_input.lower() in ['quit', 'exit', 'bye', 'q']:
                    print("\n👋 Thank you for using Krishi Mitra! Happy farming!")
                    break
                if not user_input: continue
                print("\n🤖 Assistant: ", end="", flush=True)
                response = self.get_response(user_input)
                print(response)
            except (KeyboardInterrupt, EOFError):
                print("\n\n👋 Goodbye!")
                break

def main():
    chatbot = CropChatBot()
    chatbot.start_chat()

if __name__ == "__main__":
    main()