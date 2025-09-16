"""
Generic Zilliz Vector Database Operations

This module provides generic vector database operations for retrieving 
documents from Zilliz Cloud using LlamaIndex integration.

Key Features:
- Domain-agnostic vector retrieval
- LlamaIndex integration for seamless querying
- Configurable similarity search parameters
- Error handling and connection management
- Support for different embedding dimensions

Usage:
    from services.vector_service import VectorRetriever
    
    retriever = VectorRetriever(collection_name="your_collection")
    results = retriever.search("your query", top_k=5)
"""

import os
import logging
from typing import List, Optional, Dict, Any
from pathlib import Path

from dotenv import load_dotenv
from llama_index.core import VectorStoreIndex, Settings
from llama_index.vector_stores.milvus import MilvusVectorStore
from llama_index.core.schema import NodeWithScore
from llama_index.embeddings.openai import OpenAIEmbedding
from pymilvus import MilvusClient
from pymilvus.exceptions import MilvusException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class VectorRetriever:
    """
    Generic vector retrieval service for Zilliz Cloud using LlamaIndex.
    
    This class provides methods to connect to Zilliz Cloud, load collections,
    and perform vector similarity searches.
    """
    
    def __init__(self, collection_name: str, embedding_dim: int = 3072, 
                 similarity_top_k: int = 3):
        """
        Initialize the vector retriever.
        
        Args:
            collection_name: Name of the Zilliz collection
            embedding_dim: Dimension of the embeddings (default: 3072)
            similarity_top_k: Number of similar documents to retrieve
        """
        self.collection_name = collection_name
        self.embedding_dim = embedding_dim
        self.similarity_top_k = similarity_top_k
        
        # Get environment variables
        self.zilliz_uri = os.getenv("ZILLIZ_CLOUD_URI")
        self.zilliz_token = os.getenv("ZILLIZ_CLOUD_TOKEN")
        
        if not self.zilliz_uri or not self.zilliz_token:
            raise ValueError("ZILLIZ_CLOUD_URI and ZILLIZ_CLOUD_TOKEN must be set in .env")
        
        # Initialize connections
        self.milvus_client = None
        self.vector_store = None
        self.index = None
        self.retriever = None
        
        logger.info(f"VectorRetriever initialized for collection: {collection_name}")
    
    def connect(self) -> bool:
        """
        Connect to Zilliz Cloud and initialize the vector store.
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            # Initialize Milvus Client
            logger.info("Connecting to Zilliz Cloud...")
            self.milvus_client = MilvusClient(uri=self.zilliz_uri, token=self.zilliz_token)
            logger.info(f"Connected to Zilliz Cloud: {self.zilliz_uri}")
            
            # Verify collection exists
            if not self.milvus_client.has_collection(self.collection_name):
                raise ValueError(f"Collection '{self.collection_name}' does not exist")
            
            # Load collection
            self.milvus_client.load_collection(self.collection_name)
            
            # Get entity count for verification
            entity_count = self.milvus_client.get_collection_stats(self.collection_name)["row_count"]
            logger.info(f"Collection '{self.collection_name}' loaded with {entity_count} entities")
            
            # Configure embedding model to match stored embeddings
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if not openai_api_key:
                raise ValueError("OPENAI_API_KEY must be set in .env")
            
            # Use text-embedding-3-large with 3072 dimensions to match stored embeddings
            embed_model = OpenAIEmbedding(
                model="text-embedding-3-large",
                dimensions=self.embedding_dim,  # 3072 dimensions
                api_key=openai_api_key
            )
            
            # Set global embedding model
            Settings.embed_model = embed_model
            logger.info(f"Configured OpenAI embedding model: text-embedding-3-large with {self.embedding_dim} dimensions")
            
            # Initialize Vector Store
            self.vector_store = MilvusVectorStore(
                uri=self.zilliz_uri,
                token=self.zilliz_token,
                collection_name=self.collection_name,
                dim=self.embedding_dim
            )
            
            # Load index from vector store
            logger.info("Loading index from Zilliz Cloud...")
            self.index = VectorStoreIndex.from_vector_store(self.vector_store)
            
            # Create retriever
            self.retriever = self.index.as_retriever(similarity_top_k=self.similarity_top_k)
            logger.info("Vector retriever initialized successfully")
            
            return True
            
        except MilvusException as e:
            logger.error(f"Milvus error during connection: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Error connecting to Zilliz Cloud: {str(e)}")
            return False
    
    def search(self, query: str, top_k: Optional[int] = None) -> List[NodeWithScore]:
        """
        Perform vector similarity search for the given query.
        
        Args:
            query: Search query text
            top_k: Number of results to return (optional, uses default if not provided)
            
        Returns:
            List of NodeWithScore objects containing matching documents and scores
        """
        if not self.retriever:
            if not self.connect():
                raise RuntimeError("Failed to establish connection to Zilliz Cloud")
        
        try:
            # Use custom top_k if provided, otherwise use instance default
            if top_k:
                retriever = self.index.as_retriever(similarity_top_k=top_k)
            else:
                retriever = self.retriever
            
            logger.info(f"Performing vector search for query: '{query[:50]}...'")
            results = retriever.retrieve(query)
            
            logger.info(f"Found {len(results)} results")
            return results
            
        except Exception as e:
            logger.error(f"Error during vector search: {str(e)}")
            raise
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the current collection.
        
        Returns:
            Dictionary containing collection statistics
        """
        if not self.milvus_client:
            if not self.connect():
                raise RuntimeError("Failed to establish connection to Zilliz Cloud")
        
        try:
            stats = self.milvus_client.get_collection_stats(self.collection_name)
            return stats
        except Exception as e:
            logger.error(f"Error getting collection stats: {str(e)}")
            raise
    
    def list_collections(self) -> List[str]:
        """
        List all available collections in Zilliz Cloud.
        
        Returns:
            List of collection names
        """
        if not self.milvus_client:
            if not self.connect():
                raise RuntimeError("Failed to establish connection to Zilliz Cloud")
        
        try:
            collections = self.milvus_client.list_collections()
            return collections
        except Exception as e:
            logger.error(f"Error listing collections: {str(e)}")
            raise
    
    def close(self):
        """Close connections and cleanup resources."""
        if self.milvus_client:
            try:
                self.milvus_client.close()
                logger.info("Zilliz Cloud connection closed")
            except Exception as e:
                logger.warning(f"Error closing connection: {str(e)}")


def create_vector_retriever(collection_name: str, embedding_dim: int = 3072, 
                          similarity_top_k: int = 3) -> VectorRetriever:
    """
    Factory function to create and connect a VectorRetriever instance.
    
    Args:
        collection_name: Name of the Zilliz collection
        embedding_dim: Dimension of the embeddings
        similarity_top_k: Number of similar documents to retrieve
        
    Returns:
        Connected VectorRetriever instance
    """
    retriever = VectorRetriever(
        collection_name=collection_name,
        embedding_dim=embedding_dim,
        similarity_top_k=similarity_top_k
    )
    
    if not retriever.connect():
        raise RuntimeError(f"Failed to connect to collection '{collection_name}'")
    
    return retriever
