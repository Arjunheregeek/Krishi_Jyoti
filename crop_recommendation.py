import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv
import pickle
import numpy as np
import re

from backend.api.Wheather.test_weather_api import get_weather_by_city
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
        try:
            with open('backend/ml/models/crop_recommendation_model.pkl', 'rb') as file:
                self.model = pickle.load(file)
            print("✅ Crop model loaded successfully!")
        except FileNotFoundError:
            print("🚨 Error: Model file not found.")
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
        city_match = re.search(r'in\s+([A-Za-z ]+)', user_input)
        city = city_match.group(1).strip() if city_match else "Pune"
        # Use LLM to estimate soil nutrients (N, P, K) and pH for the location
        soil = self.estimate_soil_nutrients_llm(city)
        return city, soil

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

    def get_model_input(self, soil, weather):
        # Require all values from soil and weather, do not use averages here
        required_soil = ["N", "P", "K", "pH"]
        required_weather = ["temperature", "humidity", "rainfall"]
        missing = [key for key in required_soil if key not in soil] + [key for key in required_weather if key not in weather]
        if missing:
            raise ValueError(f"Missing required input(s) for model: {', '.join(missing)}")
        N = soil["N"]
        P = soil["P"]
        K = soil["K"]
        pH = soil["pH"]
        temp = weather["temperature"]
        humidity = weather["humidity"]
        rainfall = weather["rainfall"]
        return np.array([[N, P, K, temp, humidity, pH, rainfall]])


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
            city, soil = self.parse_user_input(user_message)
            weather = get_weather_by_city(city)
            if "error" in weather:
                weather = {"temperature": self.avg_values[3], "humidity": self.avg_values[4], "rainfall": self.avg_values[6]}
            model_input = self.get_model_input(soil, weather)
            prediction = self.model.predict(model_input)[0]
            details = {**soil, **weather, "city": city}
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


