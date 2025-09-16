# Zilliz Cloud Vector Database Upload Guide

This guide explains how to upload your locally generated embeddings to Zilliz Cloud for production deployment.

## 📋 Prerequisites

### 1. Install Dependencies
```bash
cd backend/ai
pip install pymilvus
```

### 2. Set Up Zilliz Cloud Account
1. Go to [Zilliz Cloud](https://cloud.zilliz.com/)
2. Create an account and get your credentials
3. Create a new cluster (free tier available)
4. Get your connection URI and API token

### 3. Configure Environment Variables
Add these to your `backend/ai/.env` file:
```env
ZILLIZ_CLOUD_URI=your_cluster_endpoint
ZILLIZ_CLOUD_TOKEN=your_api_token
OPENAI_API_KEY=your_openai_key
```

## 🚀 Upload Process

### Step 1: Test Connection
```bash
cd backend/ai/scripts
python test_zilliz_connection.py
```

This will verify:
- Environment variables are set correctly
- Connection to Zilliz Cloud works
- Basic operations are functional

### Step 2: Upload Embeddings
```bash
cd backend/ai/scripts
python upload_to_zilliz.py
```

This will:
- Load your local LlamaIndex embeddings
- Create a collection schema optimized for government schemes
- Upload all embeddings in batches
- Verify the upload was successful

## 📊 Collection Schema

The script creates a collection with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | VARCHAR(100) | Unique node identifier |
| `text` | VARCHAR(65535) | Document text content |
| `embedding` | FLOAT_VECTOR(1536) | OpenAI embeddings |
| `metadata` | JSON | LlamaIndex metadata |
| `file_path` | VARCHAR(500) | Source file path |
| `header_path` | VARCHAR(1000) | Document hierarchy |
| `scheme_type` | VARCHAR(100) | central/state/special |
| `node_type` | VARCHAR(50) | LlamaIndex node type |

## 🔍 Search Configuration

- **Index Type**: IVF_FLAT
- **Metric**: COSINE similarity
- **Parameters**: nlist=1024, nprobe=10

## 📁 Files Created

| File | Purpose |
|------|---------|
| `scripts/upload_to_zilliz.py` | Main upload script |
| `scripts/test_zilliz_connection.py` | Connection test utility |
| `config/zilliz_config.json` | Collection configuration |

## 🔧 Troubleshooting

### Connection Issues
- Verify environment variables are correct
- Check Zilliz Cloud dashboard for cluster status
- Ensure network connectivity

### Upload Errors
- Check log file: `zilliz_upload.log`
- Verify local embeddings exist in `models/embeddings/schemes/`
- Ensure sufficient Zilliz Cloud storage quota

### Performance Optimization
- Batch size: 100 documents (configurable)
- Index creation after all data uploaded
- COSINE similarity for semantic search

## 🌐 Production Usage

After successful upload, update your RAG pipeline to use Zilliz Cloud:

1. Install pymilvus in your production environment
2. Use the same connection credentials
3. Search the collection using the same schema
4. Keep local embeddings as backup

## 💾 Data Management

- **Backup**: Keep local embeddings as backup
- **Updates**: Re-run upload script for new schemes
- **Monitoring**: Check Zilliz Cloud dashboard for usage metrics

## 🔒 Security Notes

- Keep ZILLIZ_CLOUD_TOKEN secure
- Use environment variables, not hardcoded credentials
- Consider IP whitelisting in Zilliz Cloud settings
- Regular credential rotation recommended

## 📈 Cost Optimization

- Free tier: 1 GB storage, 2 million queries/month
- Monitor usage in Zilliz Cloud dashboard
- Delete unused collections to save space
- Consider data retention policies
