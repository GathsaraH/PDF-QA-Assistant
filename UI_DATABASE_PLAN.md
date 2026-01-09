# 🎨 UI & Database Enhancement Plan

## 📋 Overview

**Goals:**
1. ✅ Fix scrolling issues (chat container)
2. ✅ Add PostgreSQL database for persistence
3. ✅ Store chat history & document metadata
4. ✅ **Minimize token usage** (critical for free tier)
5. ✅ Modern, beautiful UI

---

## 🎨 UI Improvements

### Current Issues
- ❌ Chat expanding height instead of scrolling
- ❌ Basic UI design
- ❌ No document list/history
- ❌ No chat history sidebar

### Proposed UI Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header: PDF Q&A Assistant                              │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │         Main Chat Area                       │
│          │         (Fixed height, scrollable)           │
│ - Docs   │                                              │
│   List   │         [Messages scroll here]               │
│          │                                              │
│ - Chat   │         [Input at bottom]                    │
│   History│                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### UI Components Needed

1. **Fixed Chat Container**
   - Fixed height (calc(100vh - 200px))
   - Scrollable message area
   - Input always at bottom

2. **Sidebar**
   - Document list (uploaded PDFs)
   - Chat history (previous conversations)
   - Search/filter

3. **Document Card**
   - Document name
   - Upload date
   - Chunk count
   - Active indicator

4. **Chat History Panel**
   - Previous conversations
   - Quick access
   - Date/time

---

## 🗄️ Database Design (PostgreSQL)

### Schema

#### 1. `documents` Table
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT,
    chunk_count INTEGER,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active'
);
```

#### 2. `chat_sessions` Table
```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    session_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `messages` Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    sources JSONB, -- Array of source citations
    token_count INTEGER, -- Track token usage
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. `token_usage` Table (Track usage)
```sql
CREATE TABLE token_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255),
    model VARCHAR(100),
    input_tokens INTEGER,
    output_tokens INTEGER,
    total_tokens INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 💰 Token Optimization Strategy

### Problem
- Passing all chat history = 1000s of tokens
- Free tier = limited tokens
- Need to minimize usage

### Solution: Smart Context Management

#### Strategy 1: **Sliding Window** (Recommended)
```
Only send last N messages to AI:
- Last 3-5 messages (recent context)
- Current question
- Retrieved chunks

Benefits:
- Minimal tokens (only recent context)
- Still maintains conversation flow
- Perfect for free tier
```

#### Strategy 2: **Summary + Recent**
```
1. Summarize old messages (once)
2. Send: Summary + Last 2 messages + Current question

Benefits:
- Captures full history in summary
- Only recent messages in detail
- Very token efficient
```

#### Strategy 3: **Relevant History Only**
```
1. Store all messages in DB
2. Only send messages relevant to current question
3. Use semantic search to find relevant past messages

Benefits:
- Only relevant context
- Most efficient
- More complex to implement
```

### Recommended: **Sliding Window (Last 3-5 messages)**

**Token Usage Example:**
```
Without optimization:
- 50 messages × 100 tokens = 5,000 tokens ❌

With sliding window (last 3):
- 3 messages × 100 tokens = 300 tokens ✅
- Retrieved chunks: ~500 tokens
- Total: ~800 tokens per query ✅
```

**Implementation:**
```python
# Only get last 3 messages from DB
recent_messages = get_last_n_messages(session_id, n=3)

# Don't pass full history to memory
# Use sliding window instead
```

---

## 🏗️ Architecture Changes

### Current Flow
```
User → Frontend → Backend → RAG → Gemini → Response
```

### New Flow (With DB)
```
User → Frontend → Backend → DB (save) → RAG → Gemini → DB (save) → Response
```

### Backend Changes

1. **Add Database Layer**
   - `database.py` - DB connection & models
   - `models.py` - SQLAlchemy models
   - `repositories.py` - Data access layer

2. **Update RAG Engine**
   - Don't use ConversationBufferMemory (stores all)
   - Use sliding window from DB
   - Track token usage

3. **New Endpoints**
   - `GET /api/documents` - List all documents
   - `GET /api/chats/:document_id` - Get chat history
   - `GET /api/usage` - Token usage stats

---

## 📊 Token Usage Tracking

### Per Query Breakdown
```
Input Tokens:
- Question: ~20 tokens
- Last 3 messages: ~300 tokens
- Retrieved chunks: ~500 tokens
- System prompt: ~50 tokens
Total Input: ~870 tokens

Output Tokens:
- Answer: ~200 tokens
Total Output: ~200 tokens

Total per query: ~1,070 tokens ✅
```

### Free Tier Limits
```
Gemini Free Tier:
- 15 requests/minute
- 1,500 requests/day
- ~1M tokens/day

With optimization:
- ~1,070 tokens/query
- ~930 queries/day possible ✅
- Well within limits!
```

---

## 🎯 Implementation Plan

### Phase 1: UI Fixes (Quick Wins)
1. ✅ Fix chat container scrolling
2. ✅ Fixed height container
3. ✅ Better message styling
4. ✅ Input always at bottom

### Phase 2: Database Setup
1. ✅ Add PostgreSQL
2. ✅ Create schema
3. ✅ Database models
4. ✅ Migration scripts

### Phase 3: Token Optimization
1. ✅ Remove ConversationBufferMemory
2. ✅ Implement sliding window
3. ✅ Get last N messages from DB
4. ✅ Track token usage

### Phase 4: Enhanced UI
1. ✅ Sidebar with document list
2. ✅ Chat history panel
3. ✅ Document cards
4. ✅ Modern design

### Phase 5: Advanced Features
1. ✅ Token usage dashboard
2. ✅ Document search
3. ✅ Chat export
4. ✅ Settings panel

---

## 🔧 Technical Stack Additions

### Backend
- `psycopg2` or `asyncpg` - PostgreSQL driver
- `SQLAlchemy` - ORM
- `alembic` - Migrations

### Frontend
- Better layout components
- Sidebar navigation
- Document cards
- Chat history list

---

## 📝 Database Queries (Optimized)

### Get Recent Messages (Sliding Window)
```python
def get_recent_messages(session_id: str, limit: int = 3):
    """Get last N messages for context"""
    return db.query(Message)\
        .filter(Message.chat_session_id == session_id)\
        .order_by(Message.created_at.desc())\
        .limit(limit)\
        .all()
```

### Save Message
```python
def save_message(session_id: str, role: str, content: str, tokens: int):
    """Save message to DB"""
    message = Message(
        chat_session_id=session_id,
        role=role,
        content=content,
        token_count=tokens
    )
    db.add(message)
    db.commit()
```

---

## 🎨 UI Mockup Structure

### Layout
```tsx
<div className="flex h-screen">
  {/* Sidebar - 300px fixed */}
  <Sidebar>
    <DocumentList />
    <ChatHistory />
  </Sidebar>
  
  {/* Main - flex-1 */}
  <MainArea>
    {/* Chat Container - Fixed height, scrollable */}
    <ChatContainer className="h-[calc(100vh-200px)] overflow-y-auto">
      <Messages />
    </ChatContainer>
    
    {/* Input - Always at bottom */}
    <InputArea className="fixed bottom-0">
      <Input />
    </InputArea>
  </MainArea>
</div>
```

---

## ✅ Success Metrics

1. **Token Usage**: < 1,200 tokens per query
2. **UI**: Smooth scrolling, no height expansion
3. **Database**: All chats & documents persisted
4. **Performance**: < 2s response time
5. **UX**: Modern, intuitive interface

---

## 🚀 Next Steps

1. **Review this plan** - Make sure it meets your needs
2. **Choose token strategy** - Sliding window recommended
3. **Set up PostgreSQL** - Local or cloud (free tier)
4. **Implement Phase 1** - UI fixes first
5. **Then Phase 2-4** - Database & optimization

---

**Ready to implement? Let me know which phase to start with!** 🎯

