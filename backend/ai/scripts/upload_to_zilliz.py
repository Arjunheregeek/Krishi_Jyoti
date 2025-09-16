import os
import logging
import json
from pathlib import Path
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential
from llama_index.core import StorageContext, load_index_from_storage
from llama_index.vector_stores.milvus import MilvusVectorStore
from llama_index.core.schema import TextNode
from pymilvus import MilvusClient

# Configure logging with UTF-8 encoding
log_handler = logging.FileHandler('upload_to_zilliz.log', encoding='utf-8')
log_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(log_handler)
logger.addHandler(console_handler)

# Load environment variables
load_dotenv()
zilliz_uri = os.getenv("ZILLIZ_CLOUD_URI")
zilliz_token = os.getenv("ZILLIZ_CLOUD_TOKEN")

if not zilliz_uri or not zilliz_token:
    raise ValueError("ZILLIZ_CLOUD_URI and ZILLIZ_CLOUD_TOKEN must be set in .env")

def upload_local_embeddings_to_zilliz():
    """Upload existing local embeddings from schemes directory to Zilliz Cloud."""
    
    # Path to local embeddings
    local_embeddings_path = Path("../models/embeddings/schemes")
    collection_name = "government_schemes_knowledge_base"
    
    logger.info(f"Starting upload of local embeddings to Zilliz Cloud...")
    logger.info(f"Local embeddings path: {local_embeddings_path.absolute()}")
    
    # Verify local embeddings exist
    if not local_embeddings_path.exists():
        raise FileNotFoundError(f"Local embeddings directory not found: {local_embeddings_path.absolute()}")
    
    required_files = ["docstore.json", "default__vector_store.json", "index_store.json"]
    for file in required_files:
        file_path = local_embeddings_path / file
        if not file_path.exists():
            raise FileNotFoundError(f"Required embedding file not found: {file_path}")
    
    logger.info("Local embeddings files verified successfully")
    
    # Load local index
    try:
        logger.info("Loading local index from storage...")
        storage_context = StorageContext.from_defaults(persist_dir=local_embeddings_path)
        index = load_index_from_storage(storage_context)
        logger.info("Local index loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load local index: {str(e)}")
        raise
    
    # Connect to Zilliz Cloud
    try:
        logger.info("Connecting to Zilliz Cloud...")
        milvus_client = MilvusClient(uri=zilliz_uri, token=zilliz_token)
        logger.info(f"Connected to Zilliz Cloud: {zilliz_uri}")
    except Exception as e:
        logger.error(f"Failed to connect to Zilliz Cloud: {str(e)}")
        raise
    
    # Check and drop existing collection if it exists
    if milvus_client.has_collection(collection_name):
        logger.info(f"Dropping existing collection: {collection_name}")
        milvus_client.drop_collection(collection_name)
        logger.info("Existing collection dropped successfully")
    
    # Create Zilliz vector store
    try:
        logger.info("Creating Zilliz vector store...")
        vector_store = MilvusVectorStore(
            uri=zilliz_uri,
            token=zilliz_token,
            collection_name=collection_name,
            dim=3072,  # Your embedding model dimension
            overwrite=True
        )
        logger.info("Zilliz vector store created successfully")
    except Exception as e:
        logger.error(f"Failed to create Zilliz vector store: {str(e)}")
        raise
    
    # Get all nodes from local index
    try:
        logger.info("Extracting nodes from local index...")
        
        # Access the vector store directly to get all nodes
        local_vector_store = storage_context.vector_store
        all_node_ids = list(local_vector_store.data.embedding_dict.keys())
        
        logger.info(f"Found {len(all_node_ids)} nodes in local index")
        
        if len(all_node_ids) == 0:
            raise ValueError("No nodes found in local index")
            
    except Exception as e:
        logger.error(f"Failed to extract nodes from local index: {str(e)}")
        raise
    
    # Validate and prepare nodes for upload
    try:
        logger.info("Validating nodes for upload...")
        valid_nodes = []
        
        # Get nodes with embeddings
        for node_id in all_node_ids:
            try:
                # Get node data from storage
                node_data = local_vector_store.data.embedding_dict.get(node_id)
                if node_data is None:
                    logger.warning(f"No embedding found for node {node_id}, skipping")
                    continue
                
                # Get document from docstore
                doc = storage_context.docstore.get_document(node_id)
                if doc is None:
                    logger.warning(f"No document found for node {node_id}, skipping")
                    continue
                
                # Validate embedding
                embedding = node_data
                if not isinstance(embedding, list) or len(embedding) != 3072:
                    logger.warning(f"Invalid embedding for node {node_id} (length: {len(embedding) if isinstance(embedding, list) else 'N/A'}), skipping")
                    continue
                
                # Create node for upload
                node = TextNode(
                    text=doc.text,
                    id_=node_id,
                    embedding=embedding,
                    metadata=doc.metadata
                )
                valid_nodes.append(node)
                
            except Exception as e:
                logger.warning(f"Error processing node {node_id}: {str(e)}, skipping")
                continue
        
        logger.info(f"Validated {len(valid_nodes)} nodes for upload")
        
        if len(valid_nodes) == 0:
            raise ValueError("No valid nodes found for upload")
            
    except Exception as e:
        logger.error(f"Failed to validate nodes: {str(e)}")
        raise
    
    # Upload nodes to Zilliz Cloud
    try:
        logger.info(f"Uploading {len(valid_nodes)} nodes to Zilliz Cloud...")
        vector_store.add(valid_nodes)
        logger.info("Nodes uploaded successfully")
    except Exception as e:
        logger.error(f"Failed to upload nodes to Zilliz Cloud: {str(e)}")
        raise
    
    # Verify upload
    try:
        logger.info("Verifying upload...")
        milvus_client.flush(collection_name)
        stats = milvus_client.get_collection_stats(collection_name)
        entity_count = stats["row_count"]
        
        logger.info(f"Upload verification complete")
        logger.info(f"Total entities in collection '{collection_name}': {entity_count}")
        
        if entity_count == 0:
            raise ValueError("Upload verification failed: No entities stored in collection")
        
        logger.info("Upload completed successfully!")
        return entity_count
        
    except Exception as e:
        logger.error(f"Upload verification failed: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        entity_count = upload_local_embeddings_to_zilliz()
        print(f"\nSUCCESS: Uploaded {entity_count} embeddings to Zilliz Cloud!")
    except Exception as e:
        print(f"\nERROR: Upload failed - {str(e)}")
        logger.error(f"Upload failed: {str(e)}")
        exit(1)
