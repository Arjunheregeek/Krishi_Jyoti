import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

# Suppress verbose logging from external libraries
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("cerebras.cloud.sdk").setLevel(logging.WARNING)

# Load environment variables
load_dotenv()

class CropChatBot:
    """Simple Cerebras-based Crop Recommendation ChatBot"""

    def __init__(self):
        """Initialize the Crop Recommendation ChatBot"""
        self.client = Cerebras(
            api_key=os.environ.get("CEREBRAS_API_KEY"),
        )
        self.conversation_history = []

        # *** UPDATED CONVERSATIONAL PROMPT ***
        self.system_prompt = (
            "You are 'Krishi Mitra,' a friendly and expert AI assistant for Indian farmers. Your goal is to provide a highly accurate crop recommendation by having a natural, step-by-step conversation. You must follow these steps precisely:\n\n"
            "1.  **Greeting & Location:** Start by greeting the user and asking for their location (city or district).\n"
            "2.  **Ask for Nitrogen (N):** Once you have the location, politely ask for the Nitrogen (N) value from their soil test. Clearly state that they can say 'I don't know' or 'skip'.\n"
            "3.  **Ask for Phosphorus (P):** After their response, ask for the Phosphorus (P) value.\n"
            "4.  **Ask for Potassium (K):** After their response, ask for the Potassium (K) value.\n"
            "5.  **Ask for pH:** After their response, ask for the soil's pH value.\n"
            "6.  **Ask for Previous Crop:** Finally, ask what crop they grew in the same field last season. This is important for your educated guess.\n\n"
            "**IMPORTANT RULES:**\n"
            "- **One Question at a Time:** Never ask for more than one piece of information at once.\n"
            "- **Educated Guess:** If the user skips any soil values (N, P, K, pH), you must use the provided location and previous crop information to make a reasonable estimate for the missing values in your final analysis.\n"
            "- **Final Recommendation:** Only after you have gathered all the information (or noted that the user skipped some), provide the final recommendation in the following structured format:\n"
            "   1.  Start with 'Based on the information provided, the best crop for you is [Crop Name].'\n"
            "   2.  Provide a section called 'Reasoning:' that briefly explains why the crop is suitable based on the user's data and your estimates.\n"
            "   3.  Provide a section called 'Quick Tips:' with one or two actionable tips for growing that crop.\n"
            "   4.  End with an encouraging closing statement.\n\n"
            "**Response Style:** Provide all answers in plain text only. Do not use any special characters, markdown formatting like asterisks, or emojis."
        )

    def add_to_history(self, role, content):
        """Add message to conversation history"""
        self.conversation_history.append({"role": role, "content": content})

        # Keep only the last 10 messages to avoid token limits
        if len(self.conversation_history) > 10:
            self.conversation_history = self.conversation_history[-10:]

    def get_response(self, user_message):
        """Get response from the Cerebras LLM"""
        try:
            # Add user message to history
            self.add_to_history("user", user_message)

            # Prepare messages for Cerebras
            messages = [{"role": "system", "content": self.system_prompt}]
            messages.extend(self.conversation_history)

            # Generate response with Cerebras
            print("🧠 Generating response...")
            response = self.client.chat.completions.create(
                messages=messages,
                model="llama-4-scout-17b-16e-instruct",
                temperature=0.7,
                max_tokens=600
            )

            # Extract response content
            assistant_response = response.choices[0].message.content

            # Add assistant response to history
            self.add_to_history("assistant", assistant_response)

            return assistant_response

        except Exception as e:
            return f"❌ Error: {str(e)}"

    def start_chat(self):
        """Start the CLI chat interface"""
        print("🌾 Crop Recommendation ChatBot")
        print("=" * 50)
        print("I will ask a few questions to provide the best crop recommendation.")
        print("Type 'quit', 'exit', or 'bye' to end the conversation.")
        print("=" * 50)

        # Start the conversation by sending an empty message to trigger the bot's first question
        initial_response = self.get_response("Let's begin.")
        print(f"\n🤖 Assistant: {initial_response}")

        while True:
            try:
                # Get user input
                user_input = input("\n👤 You: ").strip()

                # Check for exit commands
                if user_input.lower() in ['quit', 'exit', 'bye', 'q']:
                    print("\n👋 Thank you for using Crop Recommendation ChatBot!")
                    break

                # Skip empty input
                if not user_input:
                    continue

                # Show thinking indicator
                print("\n🤖 Assistant: ", end="", flush=True)

                # Get and display response
                response = self.get_response(user_input)
                print(response)

            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!")
                break
            except EOFError:
                print("\n\n👋 Goodbye!")
                break

def main():
    """Main function to run the chatbot"""
    try:
        # Check for required API keys
        if not os.environ.get("CEREBRAS_API_KEY"):
            print("❌ Error: CEREBRAS_API_KEY not found in environment variables")
            print("Please check your .env file")
            return

        # Initialize and start chatbot
        chatbot = CropChatBot()
        chatbot.start_chat()

    except Exception as e:
        print(f"❌ Failed to start chatbot: {str(e)}")

if __name__ == "__main__":
    main()

