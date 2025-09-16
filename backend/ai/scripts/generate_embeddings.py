"""
Script to generate embeddings for knowledge base documents
"""

import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from services.embedding_service import main as run_embedding_pipeline

def main():
    """
    Main function to generate embeddings for schemes
    """
    print("🎯 Government Schemes Embedding Generator")
    print("=" * 50)
    
    try:
        # Generate embeddings for schemes using LlamaIndex pipeline
        run_embedding_pipeline()
        
        print("\n" + "=" * 50)
        print("✅ Embedding generation completed successfully!")
        print("📁 Check backend/ai/models/embeddings/schemes/ for output files")
        
    except Exception as e:
        print(f"\n❌ Error during embedding generation: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
