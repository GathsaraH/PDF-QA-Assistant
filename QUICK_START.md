# ⚡ Quick Start - Copy & Paste Commands

## 🎯 Complete Setup (5 minutes)

### Step 1: Install pnpm (if needed)

```bash
npm install -g pnpm
```

### Step 2: Install Frontend

```bash
cd PDF-QA-Assistant/web
pnpm install
```

### Step 3: Install Backend

```bash
cd ../api
pip install -r requirements.txt
```

### Step 4: Create Environment Files

**Create `web/.env.local`:**
```bash
cd ../web
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

**Create `api/.env`:**
```bash
cd ../api
# Copy the content below into .env file
```

**Content for `api/.env`:**
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

**Terminal 2 - Frontend:**
```bash
cd PDF-QA-Assistant/web
pnpm dev
```

### Step 6: Open Browser

Go to: http://localhost:3000

---

## 📋 All Commands Summary

| Task | Command | Location |
|------|---------|----------|
| **Install pnpm** | `npm install -g pnpm` | Anywhere |
| **Install Frontend** | `pnpm install` | `web/` folder |
| **Install Backend** | `pip install -r requirements.txt` | `api/` folder |
| **Run Frontend** | `pnpm dev` | `web/` folder |
| **Run Backend** | `python main.py` | `api/` folder |
| **Build Frontend** | `pnpm build` | `web/` folder |

---

## 🔑 Environment Variables

### Frontend (`web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`api/.env`)
```env
OPENAI_API_KEY=your_key_here
PINECONE_API_KEY=pcsk_4LUVrw_KohcxeySNfPy3xpRvwr3kJ6cpuFfPRDKcZN8UBw8cUUSioXoXTkCRPLFQ7C9H34
PINECONE_INDEX_NAME=pdf-rag-demo
PINECONE_ENVIRONMENT=us-east-1
```

---

## ✅ Verification

1. Backend: http://localhost:8000 → Should show `{"message": "PDF RAG API is running"}`
2. Backend Docs: http://localhost:8000/docs → Should show API documentation
3. Frontend: http://localhost:3000 → Should show upload interface

---

## 🐛 Quick Fixes

**pnpm not found:**
```bash
npm install -g pnpm
```

**Python packages fail:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Port in use:**
- Backend: Change port in `api/main.py` (line 143)
- Frontend: `pnpm dev --port 3001`

---

**That's it! You're ready!** 🚀

