# 🗄️ Database Setup Guide

## 📋 Quick Setup

### Option 1: Local PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # Windows: Download from postgresql.org
   # Mac: brew install postgresql
   # Linux: sudo apt-get install postgresql
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE pdf_rag_db;
   ```

3. **Update `.env`**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/pdf_rag_db
   ```

### Option 2: Free Cloud PostgreSQL (Recommended for POC)

#### Supabase (Free Tier)
1. Go to [supabase.com](https://supabase.com)
2. Create free account
3. Create new project
4. Copy connection string
5. Add to `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@db.xxx.supabase.co:5432/postgres
   ```

#### Neon (Free Tier)
1. Go to [neon.tech](https://neon.tech)
2. Create free account
3. Create database
4. Copy connection string
5. Add to `.env`

---

## 🔧 Setup Steps

### 1. Install Dependencies
```bash
cd api
pip install -r requirements.txt
```

### 2. Update `.env` File
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pdf_rag_db

# Gemini
GEMINI_API_KEY=your_key

# Pinecone
PINECONE_API_KEY=your_key
PINECONE_INDEX_NAME=pdf-rag-demo
PINECONE_ENVIRONMENT=us-east-1
```

### 3. Initialize Database
```bash
python -c "from database import init_db; init_db()"
```

Or it will auto-create on first run!

### 4. Test
```bash
python main.py
```

---

## ✅ What Gets Stored

### Documents Table
- Session ID
- Filename
- File size
- Chunk count
- Upload date

### Messages Table
- Chat session ID
- Role (user/assistant)
- Content
- Sources (citations)
- Token count
- Timestamp

### Token Usage Table
- Session ID
- Model name
- Input/output tokens
- Total tokens
- Timestamp

---

## 🎯 Benefits

1. ✅ **Persistent Storage** - All chats saved
2. ✅ **Token Optimization** - Only last 1 message used
3. ✅ **History** - Can view past conversations
4. ✅ **Analytics** - Track token usage
5. ✅ **Scalable** - Ready for production

---

**Database will auto-create tables on first run!** 🚀

