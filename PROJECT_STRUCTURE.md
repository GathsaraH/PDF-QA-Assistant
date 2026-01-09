# Project Structure - PDF-QA-Assistant

## 📁 Complete File Structure

```
PDF-QA-Assistant/
├── web/                          # Frontend (Next.js)
│   ├── app/
│   │   ├── page.tsx             # Main page component
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── FileUpload.tsx       # PDF upload component
│   │   ├── ChatInterface.tsx   # Chat UI component
│   │   └── Citation.tsx         # Citation display
│   ├── package.json             # Frontend dependencies (pnpm)
│   ├── next.config.js           # Next.js config
│   ├── tsconfig.json            # TypeScript config
│   ├── tailwind.config.js       # Tailwind config
│   ├── postcss.config.js        # PostCSS config
│   ├── .env.local               # Frontend env vars (create this!)
│   └── README.md                # Frontend docs
│
├── api/                          # Backend (Python FastAPI)
│   ├── main.py                  # FastAPI application
│   ├── pdf_processor.py         # PDF extraction & chunking
│   ├── rag_engine_pinecone.py   # RAG engine with Pinecone
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Backend env vars (create this!)
│   ├── uploads/                 # Temporary PDF storage (auto-created)
│   └── README.md                # Backend docs
│
├── README.md                     # Main project README
├── SETUP.md                      # Complete setup guide
├── QUICK_START.md                # Quick commands
└── PROJECT_STRUCTURE.md          # This file
```

## 🔄 Data Flow

```
User (Browser)
    ↓
Frontend (Next.js - Port 3000)
    ↓ HTTP Requests
Backend API (FastAPI - Port 8000)
    ↓
PDF Processing → RAG Engine → Pinecone → OpenAI
    ↓
Response with Answer + Citations
    ↓
Frontend displays result
```

## 📦 Dependencies

### Frontend (`web/package.json`)
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons

### Backend (`api/requirements.txt`)
- FastAPI
- Uvicorn
- LangChain
- Pinecone Client
- OpenAI
- pdfplumber

## 🔑 Environment Variables

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Backend
- `OPENAI_API_KEY` - OpenAI API key
- `PINECONE_API_KEY` - Pinecone API key
- `PINECONE_INDEX_NAME` - Pinecone index name
- `PINECONE_ENVIRONMENT` - Pinecone environment

## 🚀 Running the Application

### Development

**Terminal 1 - Backend:**
```bash
cd api
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd web
pnpm dev
```

### Production

**Backend:**
```bash
cd api
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd web
pnpm build
pnpm start
```

## 📝 Key Files

### Frontend
- `web/app/page.tsx` - Main UI
- `web/components/FileUpload.tsx` - Upload component (calls backend)
- `web/components/ChatInterface.tsx` - Chat component (calls backend)

### Backend
- `api/main.py` - FastAPI app with endpoints
- `api/pdf_processor.py` - PDF processing logic
- `api/rag_engine_pinecone.py` - RAG engine with Pinecone

## 🔌 API Communication

Frontend calls backend at: `http://localhost:8000`

**Endpoints:**
- `POST /api/upload` - Upload PDF
- `POST /api/chat` - Ask questions
- `GET /health` - Health check
- `DELETE /api/session/{id}` - Clear session

---

**This is a full-stack application with separate frontend and backend!** 🎯

