# 🔧 DATABASE_URL Format Guide

## ❌ Common Error

```
invalid dsn: invalid connection option "schema"
```

This happens when your connection string has invalid parameters.

---

## ✅ Correct Formats

### Supabase Connection String
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

**Example:**
```env
DATABASE_URL=postgresql://postgres:mypassword123@db.abcdefgh.supabase.co:5432/postgres
```

### Neon Connection String
```env
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname
```

### Local PostgreSQL
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/pdf_rag_db
```

---

## ⚠️ What NOT to Include

### ❌ Don't Include These:
- `?schema=public` - Not supported
- `?schema=default` - Not supported
- Any `schema=` parameter

### ✅ You CAN Include:
- `?sslmode=require` - For secure connections
- `?sslmode=disable` - For local dev

---

## 🔍 How to Get Correct URL

### From Supabase:
1. Go to Project Settings → Database
2. Find "Connection string" → "URI"
3. Copy the string
4. Replace `[YOUR-PASSWORD]` with your actual password
5. Remove any `?schema=` if present

### From Neon:
1. Go to Dashboard → Your Database
2. Click "Connection Details"
3. Copy "Connection string"
4. Use as-is (usually correct format)

---

## 🧪 Test Your Connection String

```bash
# Test if connection string is valid
python -c "from sqlalchemy import create_engine; engine = create_engine('YOUR_URL'); engine.connect(); print('✅ Valid!')"
```

---

## 🔧 Quick Fix

If you have a URL with `schema=`:

**Before:**
```
postgresql://user:pass@host:5432/db?schema=public
```

**After:**
```
postgresql://user:pass@host:5432/db
```

The code now auto-removes `schema=` parameter, but it's better to fix it manually!

---

**Update your `.env` file and restart!** 🚀

