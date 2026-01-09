# Complete Setup Guide - Step by Step

## 📋 Prerequisites Check

- [ ] Node.js 18+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`) - If not: `npm install -g pnpm`
- [ ] Python 3.8+ installed (`python --version`)
- [ ] pip installed (`pip --version`)
- [ ] OpenAI API key ready
- [ ] Pinecone API key ready (you have it!)

## 🚀 Installation Steps

### Step 1: Install pnpm (if not installed)

```bash
npm install -g pnpm
```

### Step 2: Install Frontend Dependencies

```bash
# Navigate to web folder
cd PDF-QA-Assistant/web

# Install with pnpm
pnpm install
```

**This installs:**
- Next.js, React, TypeScript
- Tailwind CSS
- All frontend dependencies

### Step 3: Install Backend Dependencies

```bash
# Navigate to api folder
cd ../api

# Install Python packages
pip install -r requirements.txt
```

**This installs:**
- FastAPI, Uvicorn
- LangChain
- Pinecone client
- OpenAI
- pdfplumber

### Step 4: Create Environment Files

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

### Step 5: Run Both Servers

**Terminal 1 - Backend:**
```bash
cd PDF-QA-Assistant/api
python main.py
```

**You should see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
Pinecone initialized with index: pdf-rag-demo
```

**Terminal 2 - Frontend:**
```bash
cd PDF-QA-Assistant/web
pnpm dev
```

**You should see:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
```

### Step 6: Test the Application

1. Open http://localhost:3000
2. Upload a PDF file
3. Wait for "PDF processed successfully"
4. Ask a question
5. See the answer with citations!

## ✅ Verification Checklist

- [ ] Backend runs on http://localhost:8000
- [ ] Frontend runs on http://localhost:3000
- [ ] Can upload PDF
- [ ] Can ask questions
- [ ] Answers appear with citations
- [ ] Follow-up questions work

## 🔧 Common Issues

### pnpm not found
```bash
npm install -g pnpm
```

### Python package install fails
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Port 8000 already in use
Edit `api/main.py`:
```python
uvicorn.run("main:app", port=8001)  # Change port
```

### Port 3000 already in use
Edit `web/next.config.js` or use:
```bash
pnpm dev --port 3001
```

### CORS errors
Check `api/main.py` CORS settings allow `http://localhost:3000`

## 📝 Quick Command Reference

```bash
# Frontend
cd web
pnpm install      # Install
pnpm dev          # Run dev server
pnpm build        # Build for production

# Backend
cd api
pip install -r requirements.txt  # Install
python main.py                    # Run server
```

## 🎯 Next Steps

1. Test with a sample PDF
2. Try different questions
3. Test follow-up questions
4. Check API docs at http://localhost:8000/docs

---

**You're all set!** 🎉

