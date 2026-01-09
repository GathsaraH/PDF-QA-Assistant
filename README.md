# PDF Document Q&A Assistant

A full-stack RAG (Retrieval-Augmented Generation) application that allows users to upload PDF documents and ask questions about them using AI.

## 🏗️ Project Structure

```
PDF-QA-Assistant/
├── web/                    # Frontend (Next.js)
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── package.json       # Frontend dependencies
│   └── .env.local         # Frontend environment variables
│
└── api/                    # Backend (Python FastAPI)
    ├── main.py            # FastAPI application
    ├── pdf_processor.py  # PDF processing
    ├── rag_engine_pinecone.py  # RAG engine with Pinecone
    ├── requirements.txt   # Python dependencies
    └── .env               # Backend environment variables
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **pnpm** (or npm)
- **Python 3.8+** and **pip**
- **OpenAI API Key**
- **Pinecone API Key** (you have: `pcsk_4LUVrw_KohcxeySNfPy3xpRvwr3kJ6cpuFfPRDKcZN8UBw8cUUSioXoXTkCRPLFQ7C9H34`)

### Step 1: Install Frontend Dependencies

```bash
cd web
pnpm install
```

### Step 2: Install Backend Dependencies

```bash
cd ../api
pip install -r requirements.txt
```

### Step 3: Set Up Environment Variables

**Frontend** - Create `web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** - Create `api/.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=pcsk_4LUVrw_KohcxeySNfPy3xpRvwr3kJ6cpuFfPRDKcZN8UBw8cUUSioXoXTkCRPLFQ7C9H34
PINECONE_INDEX_NAME=pdf-rag-demo
PINECONE_ENVIRONMENT=us-east-1
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd api
python main.py
```
Backend runs on: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd web
pnpm dev
```
Frontend runs on: http://localhost:3000

### Step 5: Use the Application

1. Open http://localhost:3000
2. Upload a PDF file
3. Ask questions about it!

## 📋 All Commands

### Frontend (web/)

```bash
# Install dependencies
cd web
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Production
pnpm start
```

### Backend (api/)

```bash
# Install dependencies
cd api
pip install -r requirements.txt

# Run server
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --port 8000
```

## 🔑 Environment Variables

### Frontend (`web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`api/.env`)
```env
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=pcsk_4LUVrw_KohcxeySNfPy3xpRvwr3kJ6cpuFfPRDKcZN8UBw8cUUSioXoXTkCRPLFQ7C9H34
PINECONE_INDEX_NAME=pdf-rag-demo
PINECONE_ENVIRONMENT=us-east-1
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **pnpm** - Package manager

### Backend
- **FastAPI** - Python web framework
- **LangChain** - RAG orchestration
- **Pinecone** - Vector database
- **OpenAI** - Embeddings & GPT-3.5-turbo
- **pdfplumber** - PDF processing

## 📡 API Endpoints

### POST `/api/upload`
Upload and process PDF file

**Request:**
- `file`: PDF file (multipart/form-data)
- `session_id`: Session ID (optional)

**Response:**
```json
{
  "success": true,
  "message": "PDF processed successfully",
  "chunks": 45,
  "session_id": "session-123"
}
```

### POST `/api/chat`
Query the RAG system

**Request:**
```json
{
  "question": "What skills are mentioned?",
  "session_id": "session-123"
}
```

**Response:**
```json
{
  "answer": "The document mentions...",
  "sources": ["Page 2, Chunk 3"],
  "success": true
}
```

## 🎯 Features

- ✅ PDF upload with drag & drop
- ✅ Intelligent Q&A using RAG
- ✅ Conversation memory for follow-up questions
- ✅ Source citations
- ✅ Persistent vector storage (Pinecone)
- ✅ Modern, responsive UI

## 🐛 Troubleshooting

### "Module not found" errors
→ Run `pnpm install` (frontend) or `pip install -r requirements.txt` (backend)

### "API key not found"
→ Check `.env.local` (frontend) or `.env` (backend) files exist

### CORS errors
→ Ensure backend CORS allows `http://localhost:3000`

### Port already in use
→ Change ports in `main.py` (backend) or `next.config.js` (frontend)

## 📚 Documentation

- See `web/README.md` for frontend details
- See `api/README.md` for backend details

## 🚢 Deployment

### Frontend (Vercel)
1. Push `web/` to GitHub
2. Import to Vercel
3. Add `NEXT_PUBLIC_API_URL` environment variable
4. Deploy!

### Backend (Railway/Render)
1. Push `api/` to GitHub
2. Deploy to Railway or Render
3. Add environment variables
4. Update frontend `NEXT_PUBLIC_API_URL`

---

**Ready to build!** 🚀

