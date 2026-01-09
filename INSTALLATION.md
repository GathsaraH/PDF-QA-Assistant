# 📦 Complete Installation Guide

## ✅ What You Have Now

**Project Name:** `PDF-QA-Assistant`

**Structure:**
- `web/` - Frontend (Next.js with pnpm)
- `api/` - Backend (Python FastAPI)

**Full-stack application** - Frontend calls Backend API

---

## 🚀 Installation Steps

### 1. Install pnpm (Package Manager)

```bash
npm install -g pnpm
```

Verify: `pnpm --version`

### 2. Install Frontend Dependencies

```bash
cd PDF-QA-Assistant/web
pnpm install
```

**This installs:**
- Next.js, React, TypeScript
- Tailwind CSS
- All frontend packages

### 3. Install Backend Dependencies

```bash
cd ../api
pip install -r requirements.txt
```

**This installs:**
- FastAPI, Uvicorn
- LangChain
- Pinecone client (for vector DB)
- OpenAI
- pdfplumber

### 4. Create Environment Files

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

### 5. Run Both Servers

**Terminal 1 - Backend (Python):**
```bash
cd PDF-QA-Assistant/api
python main.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
Pinecone initialized with index: pdf-rag-demo
```

**Terminal 2 - Frontend (Next.js):**
```bash
cd PDF-QA-Assistant/web
pnpm dev
```

**Expected output:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
```

### 6. Open Application

Go to: **http://localhost:3000**

---

## 📋 Command Reference

### Frontend Commands (`web/`)

```bash
# Install
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Production
pnpm start

# Lint
pnpm lint
```

### Backend Commands (`api/`)

```bash
# Install
pip install -r requirements.txt

# Run
python main.py

# Or with uvicorn
uvicorn main:app --reload --port 8000
```

---

## 🔑 Environment Variables Summary

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

---

## 🎯 Quick Test

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status": "healthy"}`

2. **Backend API Docs:**
   Open: http://localhost:8000/docs

3. **Frontend:**
   Open: http://localhost:3000

---

## 🐛 Troubleshooting

### pnpm not found
```bash
npm install -g pnpm
```

### Python packages fail
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Port 8000 in use
Edit `api/main.py` line 143:
```python
uvicorn.run("main:app", port=8001)  # Change port
```

### Port 3000 in use
```bash
pnpm dev --port 3001
```

### CORS errors
Check `api/main.py` allows `http://localhost:3000`

### Module not found (Python)
```bash
cd api
pip install -r requirements.txt
```

### Module not found (Node)
```bash
cd web
pnpm install
```

---

## ✅ Verification Checklist

After installation:

- [ ] `pnpm install` completed in `web/`
- [ ] `pip install -r requirements.txt` completed in `api/`
- [ ] `web/.env.local` created
- [ ] `api/.env` created with all keys
- [ ] Backend runs on http://localhost:8000
- [ ] Frontend runs on http://localhost:3000
- [ ] Can upload PDF
- [ ] Can ask questions
- [ ] Answers appear with citations

---

## 📚 Documentation Files

- `README.md` - Main project overview
- `SETUP.md` - Detailed setup guide
- `QUICK_START.md` - Quick command reference
- `PROJECT_STRUCTURE.md` - File structure
- `web/README.md` - Frontend docs
- `api/README.md` - Backend docs

---

## 🎉 You're Ready!

**Next Steps:**
1. Upload a PDF
2. Ask questions
3. Test follow-up questions
4. Prepare for demo!

**For demo:** See `DEMO_GUIDE.md` (if created)

---

**Everything is set up!** 🚀

