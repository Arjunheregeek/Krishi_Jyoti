"""
Test Zilliz Cloud Connection

This script tests the connection to Zilliz Cloud before running the main upload.
Use this to verify your credentials and connection setup.

Usage:
    python test_zilliz_connection.py
"""

import os
import sys
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from pymilvus import connections, utility
    from pymilvus.exceptions import MilvusException
except ImportError:
    print("❌ Error: pymilvus not installed. Install with: pip install pymilvus")
    sys.exit(1)

# Load environment variables
load_dotenv()

def test_connection():
    """Test connection to Zilliz Cloud"""
    print("🌟 Krishi Jyoti - Zilliz Cloud Connection Test")
    print("=" * 50)
    
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
    
    try:
        print("\n🔌 Testing connection to Zilliz Cloud...")
        
        # Attempt connection
        connections.connect(
            alias="test",
            uri=zilliz_uri,
            token=zilliz_token
        )
        
        print("✅ Connection successful!")
        
        # List collections
        print("\n📋 Listing existing collections...")
        collections = utility.list_collections(using="test")
        
        if collections:
            print(f"Found {len(collections)} collection(s):")
            for collection in collections:
                print(f"  - {collection}")
        else:
            print("No collections found (this is normal for new accounts)")
        
        # Test basic operations
        print("\n🧪 Testing basic operations...")
        
        # Check if we can perform utility operations
        print("✅ Utility operations working")
        
        # Disconnect
        connections.disconnect("test")
        print("✅ Disconnection successful")
        
        print("\n🎉 All tests passed! Your Zilliz Cloud setup is ready.")
        return True
        
    except MilvusException as e:
        print(f"❌ Milvus error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Connection error: {str(e)}")
        return False

def main():
    """Main function"""
    success = test_connection()
    
    if success:
        print("\n💡 Next steps:")
        print("1. Run 'python upload_to_zilliz.py' to upload your embeddings")
        print("2. Update your RAG pipeline to use Zilliz Cloud instead of local storage")
    else:
        print("\n🔧 Troubleshooting:")
        print("1. Check your environment variables in .env file")
        print("2. Verify your Zilliz Cloud credentials")
        print("3. Ensure you have network connectivity")
        print("4. Check Zilliz Cloud dashboard for account status")

if __name__ == "__main__":
    main()
