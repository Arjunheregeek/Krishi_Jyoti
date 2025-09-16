import os
import sys
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

class SchemesChatBot:
    def __init__(self):
        """Initialize the Government Schemes ChatBot"""
        self.client = Cerebras(
            api_key=os.environ.get("CEREBRAS_API_KEY"),
        )
        self.conversation_history = []
        self.system_prompt = """
You are 'Scheme Mitra', a knowledgeable and helpful AI assistant specializing in Indian Government Schemes. Your goal is to provide clear, simple, and accurate information to citizens.

Your Role:
- Expert Guide: Answer questions about various government schemes, focusing on agriculture, rural development, education, healthcare, and employment.
- Clarifier: Explain complex topics like eligibility criteria, application processes, and benefits in easy-to-understand language.

Formatting Style:
- Use plain text ONLY.
- Start list items with a hyphen (-).
- For section titles like 'Objective' or 'Eligibility', write them on their own line followed by a colon. For example: 'Objective:'.
- Do NOT use any markdown characters like asterisks (*), backticks (`), or hash symbols (#).

Important Disclaimer:
- Always conclude your responses with a friendly reminder: "Please verify all details on the official government portal for the most up-to-date information." Your knowledge is based on information available up to your last training date and may not be current.
"""

    def add_to_history(self, role, content):
        """Add message to conversation history"""
        self.conversation_history.append({"role": role, "content": content})
        
        # Keep only last 10 messages to avoid token limits
        if len(self.conversation_history) > 10:
            self.conversation_history = self.conversation_history[-10:]

    def get_response(self, user_message):
        """Get response from Cerebras model"""
        try:
            # Add user message to history
            self.add_to_history("user", user_message)
            
            # Prepare messages for API
            messages = [{"role": "system", "content": self.system_prompt}]
            messages.extend(self.conversation_history)
            
            # Create chat completion
            response = self.client.chat.completions.create(
                messages=messages,
                model="llama-4-scout-17b-16e-instruct",
                temperature=0.7,
                max_tokens=500
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
        print("🏛️  Government Schemes ChatBot")
        print("=" * 50)
        print("Ask me about Indian Government Schemes!")
        print("Type 'quit', 'exit', or 'bye' to end the conversation.")
        print("=" * 50)
        
        while True:
            try:
                # Get user input
                user_input = input("\n👤 You: ").strip()
                
                # Check for exit commands
                if user_input.lower() in ['quit', 'exit', 'bye', 'q']:
                    print("\n👋 Thank you for using Government Schemes ChatBot!")
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
        # Check for API key
        if not os.environ.get("CEREBRAS_API_KEY"):
            print("❌ Error: CEREBRAS_API_KEY not found in environment variables")
            print("Please check your .env file")
            return
        
        # Initialize and start chatbot
        chatbot = SchemesChatBot()
        chatbot.start_chat()
        
    except Exception as e:
        print(f"❌ Failed to start chatbot: {str(e)}")

if __name__ == "__main__":
    main()

