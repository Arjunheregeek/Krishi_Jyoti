import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

# Suppress verbose logging from external libraries
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("services.vector_service").setLevel(logging.WARNING)
logging.getLogger("cerebras.cloud.sdk").setLevel(logging.WARNING)
logging.getLogger("openai").setLevel(logging.WARNING)
logging.getLogger("pymilvus").setLevel(logging.WARNING)

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from services.vector_service import get_fast_retriever

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

class SchemesChatBot:
    def __init__(self):
        """Initialize the Government Schemes ChatBot with RAG capabilities"""
        self.client = Cerebras(
            api_key=os.environ.get("CEREBRAS_API_KEY"),
        )
        self.conversation_history = []
        
        # Collection name for direct queries
        self.collection_name = "government_schemes_knowledge_base"
        
        # Initialize persistent fast retriever (zero-latency after first init)
        print("🚀 Initializing high-speed vector retriever...")
        try:
            self.retriever = get_fast_retriever(
                collection_name=self.collection_name,
                embedding_dim=3072,
                similarity_top_k=3
            )
            print("✅ Vector retriever ready for ultra-fast queries")
        except Exception as e:
            print(f"⚠️ Vector retriever initialization failed: {str(e)[:50]}...")
            self.retriever = None
        
        # LLM Router prompt for deciding when to use RAG
        self.router_prompt = """
You are a smart routing assistant that decides if a user query needs detailed government scheme information.

Analyze the user query and respond with ONLY ONE of these:
- "SIMPLE" - for greetings, thanks, general chat, or questions that don't need scheme details
- "RAG_NEEDED" - for questions about specific schemes, benefits, eligibility, applications, or detailed information

Examples:
- "Hello" → SIMPLE
- "Thank you" → SIMPLE  
- "What is PM-KISAN?" → RAG_NEEDED
- "How to apply for crop insurance?" → RAG_NEEDED
- "What schemes help farmers?" → RAG_NEEDED

Query: {query}
Decision:"""

        # Query enhancement prompt for better RAG retrieval
        self.query_enhancer_prompt = """
You are an expert at expanding farmer queries to retrieve comprehensive scheme information.

Original Query: {original_query}

Create 3-4 enhanced search queries that will help retrieve ALL relevant information including:
- Scheme details and objectives
- Benefits and financial assistance
- Eligibility criteria and requirements
- Application process and required documents
- Deadlines and contact information

Format your response as a simple list, one query per line:
- Enhanced query 1
- Enhanced query 2  
- Enhanced query 3
- Enhanced query 4

Enhanced Queries:"""
        
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

    def direct_vector_search(self, query: str, top_k: int = 3) -> list:
        """Ultra-fast vector search using persistent connections"""
        try:
            if not self.retriever:
                # Fallback: initialize retriever if not available
                self.retriever = get_fast_retriever(
                    collection_name=self.collection_name,
                    embedding_dim=3072,
                    similarity_top_k=top_k
                )
            
            # Perform lightning-fast search (no connection overhead)
            results = self.retriever.search(query, top_k=top_k)
            
            return results
            
        except Exception as e:
            print(f"⚠️ Search error: {str(e)[:50]}...")
            return []

    def should_use_rag(self, query: str) -> bool:
        """LLM Router: Decide if query needs RAG"""
        try:
            router_response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": self.router_prompt.format(query=query)}],
                model="llama-4-scout-17b-16e-instruct",
                temperature=0.1,
                max_tokens=10
            )
            
            decision = router_response.choices[0].message.content.strip()
            return "RAG_NEEDED" in decision
            
        except Exception as e:
            # Silently default to RAG if router fails
            return True

    def enhance_query(self, original_query: str) -> list:
        """Enhance query for better RAG retrieval"""
        try:
            enhancement_response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": self.query_enhancer_prompt.format(original_query=original_query)}],
                model="llama-4-scout-17b-16e-instruct", 
                temperature=0.3,
                max_tokens=200
            )
            
            enhanced_text = enhancement_response.choices[0].message.content.strip()
            
            # Parse enhanced queries (remove bullets and clean up)
            enhanced_queries = []
            for line in enhanced_text.split('\n'):
                line = line.strip()
                if line and not line.startswith('Enhanced Queries:'):
                    # Remove bullet points and clean up
                    clean_line = line.lstrip('- *•').strip()
                    if clean_line:
                        enhanced_queries.append(clean_line)
            
            # Always include original query as fallback
            if original_query not in enhanced_queries:
                enhanced_queries.append(original_query)
                
            return enhanced_queries[:4]  # Limit to 4 queries
            
        except Exception as e:
            # Silently fallback to original query
            return [original_query]

    def retrieve_context(self, queries: list) -> str:
        """Retrieve relevant context using enhanced queries with direct search"""
        try:
            all_contexts = []
            seen_content = set()  # Avoid duplicate content
            
            for query in queries:
                results = self.direct_vector_search(query, top_k=3)
                
                for result in results:
                    content = result.get_content()
                    # Simple deduplication based on first 100 characters
                    content_key = content[:100]
                    if content_key not in seen_content:
                        all_contexts.append(f"[Score: {result.score:.3f}] {content}")
                        seen_content.add(content_key)
            
            # Limit total context length
            combined_context = "\n\n".join(all_contexts[:8])  # Max 8 chunks
            
            if len(combined_context) > 4000:  # Truncate if too long
                combined_context = combined_context[:4000] + "..."
                
            return combined_context
            
        except Exception as e:
            # Silently handle errors
            return ""

    def get_response(self, user_message):
        """Get response using LLM Router and RAG when needed"""
        try:
            # Step 1: Router decides if RAG is needed
            print("🤔 Analyzing query...")
            needs_rag = self.should_use_rag(user_message)
            
            context = ""
            if needs_rag:
                print("📚 Searching knowledge base...")
                
                # Direct RAG without initialization
                # Step 2: Enhance query for better retrieval
                enhanced_queries = self.enhance_query(user_message)
                
                # Step 3: Retrieve context using direct queries
                context = self.retrieve_context(enhanced_queries)
                
                if context:
                    print("✅ Found relevant information")
                else:
                    print("ℹ️ Using general knowledge")
            else:
                print("💬 Using general knowledge")
            
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
        chatbot.start_chat()
        
    except Exception as e:
        print(f"❌ Failed to start chatbot: {str(e)}")

if __name__ == "__main__":
    main()

