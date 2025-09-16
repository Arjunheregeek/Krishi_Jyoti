"""
Government Schemes RAG Service

This module provides RAG (Retrieval-Augmented Generation) functionality for government schemes.
It includes LLM routing, query enhancement, and context retrieval capabilities.
"""

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


class SchemesRAGService:
    """
    RAG Service for Government Schemes with LLM routing and query enhancement.
    
    This service handles:
    - Intelligent routing to decide when RAG is needed
    - Query enhancement for better retrieval
    - Fast vector search with persistent connections
    - Context retrieval and formatting
    """
    
    def __init__(self, collection_name: str = "government_schemes_knowledge_base"):
        """Initialize the RAG service"""
        self.client = Cerebras(
            api_key=os.environ.get("CEREBRAS_API_KEY"),
        )
        self.collection_name = collection_name
        
        # Initialize persistent fast retriever (zero-latency after first init)
        print("🚀 Initializing high-speed RAG service...")
        try:
            self.retriever = get_fast_retriever(
                collection_name=self.collection_name,
                embedding_dim=3072,
                similarity_top_k=3
            )
            print("✅ RAG service ready for ultra-fast queries")
        except Exception as e:
            print(f"⚠️ RAG service initialization failed: {str(e)[:50]}...")
            self.retriever = None
        
        # LLM Router prompt for deciding when to use RAG
        self.router_prompt = """
You are a smart routing assistant that decides if a user query needs detailed government scheme information.

Analyze the user query and respond with ONLY ONE of these:
- "SIMPLE" - for greetings, thanks, general chat, or questions that don't need scheme details
- "RAG_NEEDED" - for questions about specific schemes, benefits, eligibility, applications, or detailed information

Do NOT use any markdown characters like asterisks (*), backticks (`), or hash symbols (#).

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

Format your response as a simple list, one query per line.
Do NOT use any markdown characters like asterisks (*), backticks (`), or hash symbols (#).

Enhanced Queries:"""

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

    def get_enhanced_context(self, user_query: str) -> tuple[bool, str]:
        """
        Main RAG pipeline: Route query and retrieve context if needed.
        
        Args:
            user_query: User's question/query
            
        Returns:
            Tuple of (needs_rag: bool, context: str)
        """
        try:
            # Step 1: Router decides if RAG is needed
            print("🤔 Analyzing query...")
            needs_rag = self.should_use_rag(user_query)
            
            if not needs_rag:
                print("💬 Using general knowledge")
                return False, ""
            
            print("📚 Searching knowledge base...")
            
            # Step 2: Enhance query for better retrieval
            enhanced_queries = self.enhance_query(user_query)
            
            # Step 3: Retrieve context using direct queries
            context = self.retrieve_context(enhanced_queries)
            
            if context:
                print("✅ Found relevant information")
                return True, context
            else:
                print("ℹ️ No relevant information found")
                return False, ""
                
        except Exception as e:
            print(f"⚠️ RAG error: {str(e)[:50]}...")
            return False, ""

    def is_ready(self) -> bool:
        """Check if RAG service is ready for queries"""
        return self.retriever is not None and self.retriever.is_connected()

    def get_stats(self) -> dict:
        """Get RAG service statistics"""
        try:
            if self.retriever:
                return self.retriever.get_collection_stats()
            return {"status": "not_initialized"}
        except Exception as e:
            return {"error": str(e)}


# Factory function for easy initialization
def create_rag_service(collection_name: str = "government_schemes_knowledge_base") -> SchemesRAGService:
    """
    Create and initialize a RAG service instance.
    
    Args:
        collection_name: Name of the vector database collection
        
    Returns:
        Initialized SchemesRAGService instance
    """
    return SchemesRAGService(collection_name=collection_name)