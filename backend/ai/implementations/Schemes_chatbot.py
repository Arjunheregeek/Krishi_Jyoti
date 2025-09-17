import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

# Suppress verbose logging from external libraries
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("cerebras.cloud.sdk").setLevel(logging.WARNING)

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

# Import the RAG service
from .schemes_rag import create_rag_service

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

class SchemesChatBot:
    """Clean Government Schemes ChatBot using separated RAG service"""
    
    def __init__(self):
        """Initialize the Government Schemes ChatBot"""
        self.client = Cerebras(
            api_key=os.environ.get("CEREBRAS_API_KEY"),
        )
        self.conversation_history = []
        
        # Initialize RAG service
        print("🚀 Initializing RAG service...")
        try:
            self.rag_service = create_rag_service("government_schemes_knowledge_base")
            print("✅ ChatBot ready with RAG capabilities")
        except Exception as e:
            print(f"⚠️ RAG service initialization failed: {str(e)[:50]}...")
            self.rag_service = None
        
        # System prompt for the chatbot
        self.system_prompt = """
You are 'Scheme Mitra', a knowledgeable and helpful AI assistant specializing in Indian Government Schemes. Your goal is to provide clear, simple, and accurate information to citizens.

Your Role:
- Expert Guide: Answer questions about various government schemes, focusing on agriculture, rural development, education, healthcare, and employment.
- Clarifier: Explain complex topics like eligibility criteria, application processes, and benefits in easy-to-understand language.

When provided with CONTEXT from government scheme documents, use that information as your primary source and reference it in your responses.

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
        """Get response using separated RAG service"""
        try:
            # Use RAG service for intelligent routing and context retrieval
            context = ""
            if self.rag_service:
                needs_rag, context = self.rag_service.get_enhanced_context(user_message)
            else:
                print("ℹ️ RAG service unavailable, using general knowledge")
            
            # Add user message to history
            self.add_to_history("user", user_message)
            
            # Prepare messages for Cerebras
            messages = [{"role": "system", "content": self.system_prompt}]
            
            # Add context if retrieved
            if context:
                context_message = f"""
CONTEXT FROM GOVERNMENT SCHEME DOCUMENTS:

{context}

Based on the above context and your knowledge, please answer the user's question comprehensively."""
                messages.append({"role": "system", "content": context_message})
            
            # Add conversation history
            messages.extend(self.conversation_history)
            
            # Generate response with Cerebras
            print("🧠 Generating response...")
            response = self.client.chat.completions.create(
                messages=messages,
                model="llama-4-scout-17b-16e-instruct",
                temperature=0.7,
                max_tokens=600  # Increased for detailed responses
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
        # Check for required API keys
        if not os.environ.get("CEREBRAS_API_KEY"):
            print("❌ Error: CEREBRAS_API_KEY not found in environment variables")
            print("Please check your .env file")
            return
            
        # Check for RAG-related environment variables (optional but recommended)
        if not os.environ.get("ZILLIZ_CLOUD_URI") or not os.environ.get("ZILLIZ_CLOUD_TOKEN"):
            print("⚠️ Warning: Zilliz Cloud credentials not found")
            print("RAG functionality will be limited to general knowledge")
            print("Add ZILLIZ_CLOUD_URI and ZILLIZ_CLOUD_TOKEN to .env for full functionality")
        
        # Initialize and start chatbot
        chatbot = SchemesChatBot()
        
        # Check if RAG service is ready
        if chatbot.rag_service and chatbot.rag_service.is_ready():
            print("✅ RAG service is ready")
        else:
            print("⚠️ RAG service not ready - will use general knowledge only")
        
        chatbot.start_chat()
        
    except Exception as e:
        print(f"❌ Failed to start chatbot: {str(e)}")

if __name__ == "__main__":
    main()

