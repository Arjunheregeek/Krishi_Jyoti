import os
import sys
import logging
from pathlib import Path
project_root = Path(__file__).resolve()
while not (project_root / "backend").exists() and project_root != project_root.parent:
    project_root = project_root.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
from dotenv import load_dotenv
import pickle
import numpy as np
import re

from backend.api.Wheather.demo_weather import get_weather
from cerebras.cloud.sdk import Cerebras
import json

# Suppress verbose logging from external libraries
logging.getLogger("httpx").setLevel(logging.WARNING)

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

class CropChatBot:
    """Crop Recommendation ChatBot with weather and LLM enhancement"""

    def __init__(self):
        # Load ML model
        self.llm_client = Cerebras(api_key=os.environ.get("CEREBRAS_API_KEY_2"))
        model_path = project_root / "backend" / "ml" / "models" / "crop_recommendation_model.pkl"
        try:
            with open(model_path, 'rb') as file:
                self.model = pickle.load(file)
            print("✅ Crop model loaded successfully!")
        except FileNotFoundError:
            print(f"🚨 Error: Model file not found at {model_path}.")
            exit()
        self.avg_values = [50.55, 53.36, 48.15, 25.62, 71.48, 7.0, 103.46]
        self.conversation_history = []
        self.system_prompt = (
            "You are 'Krishi Mitra', an expert AI assistant for Indian farmers. "
            "You recommend the best crops based on soil, weather, and user needs. "
            "Always explain your reasoning in simple language."
        )

    def add_to_history(self, role, content):
        self.conversation_history.append({"role": role, "content": content})
        if len(self.conversation_history) > 10:
            self.conversation_history = self.conversation_history[-10:]

    def parse_user_input(self, user_input):
        # Let LLM extract location and crop from user input
        import json
        prompt = (
            f"Extract the location (city, district, or region in India) and the crop the user wants to grow from this message: '{user_input}'. "
            "Respond ONLY with a JSON object in the format: {\"location\": location_string, \"crop\": crop_string}. "
            "If location or crop is not found, use 'Unknown'."
        )
        messages = [
            {"role": "system", "content": "You are an expert agri assistant for Indian farmers."},
            {"role": "user", "content": prompt}
        ]
        response = self.llm_client.chat.completions.create(
            messages=messages,
            model="llama-4-scout-17b-16e-instruct",
            temperature=0.2,
            max_tokens=100
        )
        try:
            parsed = json.loads(response.choices[0].message.content)
            city = parsed.get("location", "Pune")
            crop = parsed.get("crop", "Unknown")
        except Exception:
            city = "Pune"
            crop = "Unknown"
        weather = get_weather(city=city)
        # Use LLM to parse weather and generate model input (N, P, K, pH, temp, humidity, rainfall)
        model_input = self.llm_parse_weather_and_soil(city, weather)
        model_input["crop"] = crop
        return city, model_input

    def llm_parse_weather_and_soil(self, city, weather):
        import json
        prompt = (
            f"Given the following weather data for {city}, India: {json.dumps(weather)}\n"
            "Estimate and return a JSON object with these fields for crop recommendation: "
            "N, P, K (kg/ha), pH, temperature (C), humidity (%), rainfall (mm). "
            "Respond ONLY with a JSON object in this format: "
            "{\"N\": value, \"P\": value, \"K\": value, \"pH\": value, \"temperature\": value, \"humidity\": value, \"rainfall\": value}"
        )
        messages = [
            {"role": "system", "content": "You are an expert agri scientist and weather analyst for Indian agriculture."},
            {"role": "user", "content": prompt}
        ]
        response = self.llm_client.chat.completions.create(
            messages=messages,
            model="llama-4-scout-17b-16e-instruct",
            temperature=0.3,
            max_tokens=300
        )
        # Try to parse JSON from LLM response
        try:
            model_input = json.loads(response.choices[0].message.content)
        except Exception:
            # Fallback to average values if parsing fails
            model_input = {
                "N": self.avg_values[0], "P": self.avg_values[1], "K": self.avg_values[2],
                "pH": self.avg_values[5], "temperature": self.avg_values[3],
                "humidity": self.avg_values[4], "rainfall": self.avg_values[6]
            }
        # Fill missing values with averages
        model_input.setdefault("N", self.avg_values[0])
        model_input.setdefault("P", self.avg_values[1])
        model_input.setdefault("K", self.avg_values[2])
        model_input.setdefault("pH", self.avg_values[5])
        model_input.setdefault("temperature", self.avg_values[3])
        model_input.setdefault("humidity", self.avg_values[4])
        model_input.setdefault("rainfall", self.avg_values[6])
        return model_input

    def estimate_soil_nutrients_llm(self, city):
        prompt = (
            f"Estimate typical soil nutrient values (N, P, K in kg/ha and pH) for agricultural land in {city}, India. "
            "Respond ONLY with a JSON object in the format: {\"N\": value, \"P\": value, \"K\": value, \"pH\": value}"
        )
        messages = [
            {"role": "system", "content": "You are an expert soil scientist for Indian agriculture."},
            {"role": "user", "content": prompt}
        ]
        response = self.llm_client.chat.completions.create(
            messages=messages,
            model="llama-4-scout-17b-16e-instruct",
            temperature=0.3,
            max_tokens=200
        )
        # Try to parse JSON from LLM response
        try:
            soil = json.loads(response.choices[0].message.content)
        except Exception:
            # Fallback to average values if parsing fails
            soil = {"N": self.avg_values[0], "P": self.avg_values[1], "K": self.avg_values[2], "pH": self.avg_values[5]}
        # Fill missing values with averages
        soil.setdefault("N", self.avg_values[0])
        soil.setdefault("P", self.avg_values[1])
        soil.setdefault("K", self.avg_values[2])
        soil.setdefault("pH", self.avg_values[5])
        return soil

    def get_model_input(self, model_input):
        # Accepts a single dict with all required fields
        required = ["N", "P", "K", "pH", "temperature", "humidity", "rainfall"]
        missing = [key for key in required if key not in model_input]
        if missing:
            raise ValueError(f"Missing required input(s) for model: {', '.join(missing)}")
        return np.array([[model_input["N"], model_input["P"], model_input["K"], model_input["temperature"], model_input["humidity"], model_input["pH"], model_input["rainfall"]]])


    def llm_enhance(self, user_input, model_output, details):
        prompt = f"User Input: {user_input}\nModel Output: {model_output}\nDetails: {details}"
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt}
        ]
        response = self.llm_client.chat.completions.create(
            messages=messages,
            model="llama-4-scout-17b-16e-instruct",  # or your chosen model
            temperature=0.7,
            max_tokens=600
        )
        return response.choices[0].message.content

    def get_response(self, user_message):
        try:
            city, model_input = self.parse_user_input(user_message)
            model_input_arr = self.get_model_input(model_input)
            prediction = self.model.predict(model_input_arr)[0]
            details = {**model_input, "city": city}
            enhanced = self.llm_enhance(user_message, prediction, details)
            self.add_to_history("user", user_message)
            self.add_to_history("assistant", enhanced)
            return enhanced
        except Exception as e:
            return f"❌ Error: {str(e)}"

    def start_chat(self):
        print("🌾 Krishi Mitra Crop Recommendation ChatBot")
        print("=" * 50)
        print("Ask me about the best crops for your farm!")
        print("Type 'quit', 'exit', or 'bye' to end the conversation.")
        print("=" * 50)
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
            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!")
                break
            except EOFError:
                print("\n\n👋 Goodbye!")
                break

def main():
    chatbot = CropChatBot()
    chatbot.start_chat()

if __name__ == "__main__":
    main()