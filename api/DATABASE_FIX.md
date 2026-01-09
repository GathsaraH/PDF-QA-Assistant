# 🔧 Database Connection Fix

## 🐛 The Problem

Error: `invalid dsn: invalid connection option "schema"`

This happens when your DATABASE_URL contains a `schema` parameter, which psycopg2 doesn't support.

## ✅ Solution

The code now automatically removes invalid parameters from the connection string.

## 📝 Correct DATABASE_URL Format

### For Supabase/Neon (Cloud)
```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

### For Local PostgreSQL
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/pdf_rag_db
```

## ⚠️ Common Issues

### Issue 1: Schema Parameter
❌ Wrong:
```
postgresql://user:pass@host:5432/db?schema=public
```

✅ Correct:
```
postgresql://user:pass@host:5432/db
```

### Issue 2: Extra Parameters
❌ Wrong:
```
postgresql://user:pass@host:5432/db?schema=public&sslmode=require
```

✅ Correct:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

## 🔧 Quick Fix

1. Check your `.env` file
2. Make sure DATABASE_URL doesn't have `schema=` parameter
3. Restart the server

The code now auto-fixes this, but it's better to have a clean URL!

---

**The fix is applied - restart your server!** 🚀

