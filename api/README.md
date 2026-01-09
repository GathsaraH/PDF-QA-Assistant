# PDF Q&A Assistant - Backend API

FastAPI backend for PDF Document Q&A Assistant with RAG and Pinecone.

## 🚀 Quick Start

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Set Environment Variables

Create `.env` file:
```env
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=pcsk_4LUVrw_KohcxeySNfPy3xpRvwr3kJ6cpuFfPRDKcZN8UBw8cUUSioXoXTkCRPLFQ7C9H34
PINECONE_INDEX_NAME=pdf-rag-demo
PINECONE_ENVIRONMENT=us-east-1
```

### Run Server

```bash
python main.py
```

API runs on: http://localhost:8000

API Docs: http://localhost:8000/docs

## 📡 API Endpoints

### POST `/api/upload`
Upload and process PDF

### POST `/api/chat`
Query the RAG system

### GET `/health`
Health check

### DELETE `/api/session/{session_id}`
Clear a session

## 🛠️ Tech Stack

- FastAPI
- LangChain
- Pinecone
- OpenAI
- pdfplumber

