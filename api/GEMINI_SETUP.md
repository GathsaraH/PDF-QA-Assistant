# 🔄 Switching to Google Gemini

## ✅ Changes Made

### 1. **Updated Dependencies**
- Removed: `openai`
- Added: `langchain-google-genai`, `google-generativeai`

### 2. **Updated Code**
- **Embeddings**: Changed from OpenAI `text-embedding-3-small` to Gemini `text-embedding-004`
- **LLM**: Changed from OpenAI `gpt-3.5-turbo` to Gemini `gemini-1.5-flash`
- **Vector Dimension**: Updated from 1536 to 768 (Gemini embedding dimension)

### 3. **Environment Variables**
- Changed: `OPENAI_API_KEY` → `GEMINI_API_KEY`

---

## 🔑 Setup Instructions

### Step 1: Update Environment File

Edit `api/.env`:

```env
# Remove this line:
# OPENAI_API_KEY=your_openai_key

# Add this line:
GEMINI_API_KEY=AIzaSyCVNij3BFzaDUKmdMsElX1eT6065P3CaT8

# Keep these:
PINECONE_API_KEY=pcsk_4LUVrw_KohcxeySNfPy3xpRvwr3kJ6cpuFfPRDKcZN8UBw8cUUSioXoXTkCRPLFQ7C9H34
PINECONE_INDEX_NAME=pdf-rag-demo
PINECONE_ENVIRONMENT=us-east-1
```

### Step 2: Install New Dependencies

```bash
cd api
pip install langchain-google-genai google-generativeai
```

Or reinstall all:
```bash
pip install -r requirements.txt
```

### Step 3: Update Pinecone Index

**Important**: Since we changed the embedding dimension (1536 → 768), you need to:

**Option A: Delete and recreate the index** (Recommended for fresh start)
```python
# The code will auto-create the index with correct dimensions
# Just delete the old one from Pinecone dashboard if it exists
```

**Option B: Keep existing index** (If you have data you want to keep)
- You'll need to keep using 1536 dimensions
- But this won't work with Gemini embeddings (768 dims)
- **Best to recreate the index**

---

## 🎯 Gemini Models Used

### Embeddings
- **Model**: `models/text-embedding-004`
- **Dimension**: 768
- **Free Tier**: ✅ Yes

### LLM
- **Model**: `gemini-pro`
- **Speed**: Fast
- **Free Tier**: ✅ Yes (with limits)
- **Temperature**: 0.1 (for consistent answers)

---

## 💰 Free Tier Limits

### Gemini Pro (Free Tier)
- **Requests per minute**: 15
- **Requests per day**: 1,500
- **Tokens per minute**: 1,000,000
- **Perfect for demos and development!**

### Text Embedding 004
- **Free tier available**
- **No strict limits for reasonable usage**

---

## 🧪 Testing

After setup, test the backend:

```bash
cd api
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
Pinecone initialized with index: pdf-rag-demo
```

Then test upload and chat endpoints.

---

## 🔄 Migration Notes

### What Changed
1. ✅ Embedding model: OpenAI → Gemini
2. ✅ LLM model: GPT-3.5 → Gemini 1.5 Flash
3. ✅ Vector dimension: 1536 → 768
4. ✅ API key: OPENAI_API_KEY → GEMINI_API_KEY

### What Stayed the Same
- ✅ Pinecone vector database
- ✅ LangChain chains and memory
- ✅ API endpoints
- ✅ Frontend (no changes needed)

---

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY not found"
- Make sure `.env` file exists in `api/` folder
- Check the key is correct (no extra spaces)

### Error: "Dimension mismatch"
- Delete old Pinecone index
- Let the code create a new one with 768 dimensions

### Error: "Rate limit exceeded"
- You're hitting free tier limits
- Wait a minute and try again
- Or upgrade to paid tier

---

## 📚 Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [LangChain Gemini Integration](https://python.langchain.com/docs/integrations/llms/google_generative_ai)
- [Gemini Pricing](https://ai.google.dev/pricing)

---

**You're now using Google Gemini - completely free for your demo!** 🎉

