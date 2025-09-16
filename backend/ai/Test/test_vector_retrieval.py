"""
Test Vector Retrieval Service

This script tests the vector retrieval service for government schemes using Zilliz Cloud.
Since we're implementing RAG directly in the chatbot, this only tests vector retrieval.

Usage:
    python test_vector_retrieval.py
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from services.vector_service import VectorRetriever, create_vector_retriever
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_vector_retrieval():
    """Test basic vector retrieval functionality."""
    print("=" * 60)
    print("🔍 Testing Vector Retrieval Service")
    print("=" * 60)
    
    collection_name = "government_schemes_knowledge_base"
    
    try:
        # Create vector retriever
        print("1. Creating vector retriever...")
        retriever = create_vector_retriever(
            collection_name=collection_name,
            embedding_dim=3072,
            similarity_top_k=3
        )
        print("✅ Vector retriever created successfully")
        
        # Test collection stats
        print("\n2. Getting collection statistics...")
        stats = retriever.get_collection_stats()
        print(f"📊 Collection stats: {stats}")
        
        # Test sample queries
        test_queries = [
            "What schemes are available for farmers?",
            "How can I get financial assistance for agriculture?",
            "What are the eligibility criteria for government schemes?",
            "Tell me about crop insurance schemes",
            "What subsidies are available for irrigation?"
        ]
        
        print("\n3. Testing sample queries...")
        for i, query in enumerate(test_queries, 1):
            print(f"\nQuery {i}: {query}")
            print("-" * 40)
            
            results = retriever.search(query, top_k=2)
            print(f"Found {len(results)} results:")
            
            for j, result in enumerate(results, 1):
                print(f"\nResult {j}:")
                print(f"Score: {result.score:.4f}")
                print(f"Text: {result.get_content()[:200]}...")
                
        # Close connection
        retriever.close()
        print("\n✅ Vector retrieval test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Vector retrieval test failed: {str(e)}")
        return False

def test_connection():
    """Test basic connection to Zilliz Cloud."""
    print("🌟 Krishi Jyoti - Vector Retrieval Test")
    print("=" * 60)
    
    # Check environment variables
    zilliz_uri = os.getenv('ZILLIZ_CLOUD_URI')
    zilliz_token = os.getenv('ZILLIZ_CLOUD_TOKEN')
    
    if not zilliz_uri:
        print("❌ ZILLIZ_CLOUD_URI environment variable not set")
        return False
    
    if not zilliz_token:
        print("❌ ZILLIZ_CLOUD_TOKEN environment variable not set")
        return False
    
    print(f"🔗 URI: {zilliz_uri[:50]}...")
    print(f"🔑 Token: {'*' * (len(zilliz_token) - 8)}{zilliz_token[-8:]}")
    
    return True

def main():
    """Main test function."""
    print("🚀 Starting Vector Retrieval Service Test")
    print("This will test the vector retrieval functionality for your chatbot")
    print()
    
    # Test environment setup
    if not test_connection():
        print("\n❌ Environment setup failed. Please check your .env file.")
        return
    
    print("\n✅ Environment setup verified!")
    
    # Run vector retrieval test only
    try:
        print(f"\n🧪 Running Vector Retrieval test...")
        result = test_vector_retrieval()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"Vector Retrieval: {status}")
        
        if result:
            print("\n🎉 Vector retrieval test passed! Your system is ready for RAG integration!")
            print("\n💡 Next steps:")
            print("1. Integrate vector retrieval into your schemes_chatbot.py")
            print("2. Add retrieved documents as context to Cerebras prompts")
            print("3. Test the complete chatbot with RAG functionality")
        else:
            print("\n⚠️ Vector retrieval test failed. Please check the errors above.")
            
    except Exception as e:
        print(f"❌ Vector retrieval test crashed: {str(e)}")
        print("\n⚠️ Test failed. Please check the errors above.")

if __name__ == "__main__":
    main()
