"""
A LlamaIndex pipeline to create and manage embeddings for a knowledge base.
This script replaces the custom 'embedding_service.py' and leverages
LlamaIndex components for parsing, indexing, and storage.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# LlamaIndex Core Imports
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    Settings,
    load_index_from_storage,
)
from llama_index.core.node_parser import MarkdownNodeParser

# LlamaIndex OpenAI Integration
from llama_index.embeddings.openai import OpenAIEmbedding

# Load environment variables from a .env file in the project root
load_dotenv()

def create_or_load_index(knowledge_base_dir: Path, index_persist_dir: Path) -> VectorStoreIndex:
    """
    Creates a new vector index from a knowledge base or loads an existing one.

    This function encapsulates the entire ingestion pipeline:
    1. Checks if a persisted index exists.
    2. If it exists, it's loaded from disk.
    3. If not, it reads documents, parses them using a Markdown-aware parser,
       creates embeddings, and builds the index.
    4. The newly created index is then persisted to disk for future use.

    Args:
        knowledge_base_dir: The directory containing the markdown knowledge base files.
        index_persist_dir: The directory where the index is stored.

    Returns:
        The loaded or newly created VectorStoreIndex object.
    """
    # Configure LlamaIndex global settings
    # This is a best practice to set up your components in one place.
    Settings.embed_model = OpenAIEmbedding(
        model="text-embedding-3-large",
        api_key=os.getenv("OPENAI_API_KEY")
    )
    # The MarkdownNodeParser is the LlamaIndex equivalent of your custom
    # hierarchical chunking logic. It understands markdown structure.
    Settings.node_parser = MarkdownNodeParser()

    # Check if the index is already built and saved
    if index_persist_dir.exists():
        print(f"✅ Loading existing index from: {index_persist_dir}")
        storage_context = StorageContext.from_defaults(persist_dir=str(index_persist_dir))
        index = load_index_from_storage(storage_context)
        print("   -> Index loaded successfully.")
        return index

    # If the index doesn't exist, build it from scratch
    print(f"❌ No existing index found. Building a new one...")

    # Use SimpleDirectoryReader to load your markdown file(s).
    # This is more scalable than reading a single file manually.
    print(f"   📖 Loading documents from: {knowledge_base_dir}")
    documents = SimpleDirectoryReader(
        input_dir=str(knowledge_base_dir),
        required_exts=[".md"] # Ensures only markdown files are read
    ).load_data()
    print(f"   -> Found {len(documents)} document(s).")

    # This one line handles the entire indexing process:
    # - Parsing the document into nodes (chunks) using the MarkdownNodeParser.
    # - Creating embeddings for each node using the OpenAIEmbedding model.
    # - Storing the nodes and their embeddings in a vector store.
    print("   🚀 Creating index and generating embeddings... (This may take a moment)")
    index = VectorStoreIndex.from_documents(
        documents,
        show_progress=True # Shows a progress bar
    )
    print("   -> Indexing complete.")

    # Persist the index to disk for future use.
    print(f"   💾 Persisting index to: {index_persist_dir}")
    index.storage_context.persist(persist_dir=str(index_persist_dir))
    print("   -> Index persisted successfully.")

    return index


def main():
    """
    Main function to run the indexing pipeline and test it with a query.
    """
    print("🚀 Starting LlamaIndex RAG Pipeline...")

    # Define the directory structure based on your project setup
    base_dir = Path(__file__).resolve().parent.parent
    # This is where your Schemes.md file is located
    KB_DIR = base_dir / 'implementations' / 'Kb'
    # This is where the index will be saved
    PERSIST_DIR = base_dir / 'models' / 'embeddings' / 'schemes'

    # Ensure the knowledge base directory exists
    if not KB_DIR.exists():
        print(f"❌ CRITICAL: Knowledge base directory not found.")
        print(f"   Please create the directory '{KB_DIR}' and place your markdown file inside.")
        return

    try:
        # Create or load the index
        index = create_or_load_index(KB_DIR, PERSIST_DIR)

        # The index is now ready! You can use it to build a query engine.
        print("\n✅ Index is ready for querying.")

        # Create a query engine from the index
        query_engine = index.as_query_engine(similarity_top_k=3)

        # Run a test query
        test_query = "What are the key benefits of the PM-KISAN scheme for a farmer?"
        print(f"\n🔬 Running a test query: '{test_query}'")
        response = query_engine.query(test_query)

        print("\n--- Test Query Response ---")
        print(response)
        print("---------------------------\n")

        print("🎉 LlamaIndex pipeline executed successfully!")

    except Exception as e:
        print(f"\n❌ An error occurred during the pipeline execution: {e}")
        # This can often be due to a missing or invalid OpenAI API key.
        if "Incorrect API key" in str(e):
            print("   -> HINT: Please ensure your OPENAI_API_KEY is set correctly in your .env file.")


if __name__ == "__main__":
    main()
