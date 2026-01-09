# 📋 All Commands - Complete Reference

## 🚀 Complete Setup (Copy & Paste)

### Step 1: Install pnpm
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

**Frontend** - `web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** - `api/.env`:
```env
OPENAI_API_KEY=your_openai_key_here
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
```
http://localhost:3000
```

---

## 📦 Installation Commands

### Frontend (web/)
```bash
cd web
pnpm install          # Install dependencies
pnpm dev              # Development server
pnpm build            # Build for production
pnpm start            # Production server
pnpm lint             # Lint code
```

### Backend (api/)
```bash
cd api
pip install -r requirements.txt    # Install dependencies
python main.py                      # Run server
uvicorn main:app --reload           # Run with auto-reload
```

---

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

---

## ✅ Verification Commands

### Check Backend
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

### Check Backend API Docs
Open: http://localhost:8000/docs

### Check Frontend
Open: http://localhost:3000

---

## 🐛 Troubleshooting Commands

### Reinstall Frontend
```bash
cd web
rm -rf node_modules
pnpm install
```

### Reinstall Backend
```bash
cd api
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Check Python Version
```bash
python --version  # Should be 3.8+
```

### Check Node Version
```bash
node --version  # Should be 18+
```

### Check pnpm Version
```bash
pnpm --version
```

---

## 📊 Project Structure Commands

### List Frontend Files
```bash
cd web
ls -la
```

### List Backend Files
```bash
cd api
ls -la
```

### Check Environment Files
```bash
# Frontend
cat web/.env.local

# Backend
cat api/.env
```

---

## 🎯 Quick Start (All in One)

```bash
# 1. Install pnpm
npm install -g pnpm

# 2. Install Frontend
cd PDF-QA-Assistant/web && pnpm install

# 3. Install Backend
cd ../api && pip install -r requirements.txt

# 4. Create .env files (see above)

# 5. Run Backend (Terminal 1)
cd api && python main.py

# 6. Run Frontend (Terminal 2)
cd web && pnpm dev
```

---

**That's everything you need!** 🚀

