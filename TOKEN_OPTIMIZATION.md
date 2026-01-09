# 💰 Token Optimization Strategy

## 🎯 Goal
**Minimize token usage while maintaining conversation quality**

---

## 📊 Current Problem

### Without Optimization
```
Every query sends:
- All previous messages (50+ messages)
- Each message: ~100 tokens
- Total: 5,000+ tokens per query ❌
- Free tier exhausted quickly
```

### With Optimization
```
Every query sends:
- Last 3-5 messages only
- Total: ~300-500 tokens ✅
- 10x reduction!
```

---

## 🔧 Strategy: Sliding Window

### How It Works

```
Chat History in DB:
1. Message 1 (old)
2. Message 2 (old)
3. Message 3 (old)
...
48. Message 48 (old)
49. Message 49 (recent)
50. Message 50 (recent)
51. Message 51 (recent) ← Last 3

When asking new question:
✅ Only send messages 49, 50, 51
❌ Don't send messages 1-48
```

### Implementation

```python
# OLD WAY (Bad - uses all history)
memory = ConversationBufferMemory()
# Stores ALL messages in memory
# Sends ALL to AI every time ❌

# NEW WAY (Good - sliding window)
def get_context_for_llm(session_id: str, question: str):
    # Get last 3 messages from DB
    recent_messages = get_last_n_messages(session_id, n=3)
    
    # Format for LLM
    context = format_messages(recent_messages)
    
    # Add current question
    context += f"\nUser: {question}"
    
    # Send to LLM
    return llm.invoke(context)
```

---

## 📈 Token Usage Breakdown

### Per Query (Optimized)

```
Input Tokens:
├─ System prompt: ~50 tokens
├─ Last 3 messages: ~300 tokens (100 each)
├─ Retrieved chunks: ~500 tokens (3 chunks)
└─ Current question: ~20 tokens
Total Input: ~870 tokens ✅

Output Tokens:
└─ Answer: ~200 tokens
Total Output: ~200 tokens ✅

Total per query: ~1,070 tokens ✅
```

### Comparison

| Strategy | Tokens/Query | Queries/Day (1M limit) |
|----------|--------------|------------------------|
| All History | ~5,000 | 200 ❌ |
| Sliding Window (3) | ~1,070 | 930 ✅ |
| Sliding Window (5) | ~1,500 | 666 ✅ |

**Recommendation: Use 3 messages (best balance)**

---

## 🎯 Implementation Details

### Step 1: Remove ConversationBufferMemory

**Current Code:**
```python
memory = ConversationBufferMemory()  # ❌ Stores all
chain = ConversationalRetrievalChain.from_llm(
    llm, retriever, memory=memory  # ❌ Sends all
)
```

**New Code:**
```python
# Don't use memory object
# Get messages from DB instead
recent_messages = get_recent_messages(session_id, n=3)

# Format for chain
formatted_context = format_messages(recent_messages)

# Use in chain (without memory parameter)
chain = ConversationalRetrievalChain.from_llm(
    llm, retriever  # ✅ No memory, we handle context
)
```

### Step 2: Custom Context Injection

```python
def query_rag_optimized(session_id: str, question: str):
    # Get recent messages from DB
    recent = get_recent_messages(session_id, n=3)
    
    # Format context
    context = ""
    for msg in recent:
        context += f"{msg.role}: {msg.content}\n"
    
    # Add current question
    full_question = f"{context}User: {question}"
    
    # Query with context
    result = chain.invoke({"question": full_question})
    
    # Save new message to DB
    save_message(session_id, "user", question)
    save_message(session_id, "assistant", result["answer"])
    
    return result
```

---

## 💾 Database Schema for Messages

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    session_id VARCHAR(255),
    role VARCHAR(20), -- 'user' or 'assistant'
    content TEXT,
    created_at TIMESTAMP,
    token_count INTEGER
);

-- Get last N messages
SELECT * FROM messages 
WHERE session_id = ?
ORDER BY created_at DESC 
LIMIT 3;
```

---

## 🔍 Token Tracking

### Track Usage Per Query

```python
def track_tokens(session_id: str, input_tokens: int, output_tokens: int):
    """Save token usage to DB"""
    db.execute("""
        INSERT INTO token_usage 
        (session_id, input_tokens, output_tokens, total_tokens)
        VALUES (?, ?, ?, ?)
    """, (session_id, input_tokens, output_tokens, 
          input_tokens + output_tokens))
```

### Monitor Daily Usage

```python
def get_daily_usage():
    """Get today's token usage"""
    return db.execute("""
        SELECT SUM(total_tokens) as total
        FROM token_usage
        WHERE DATE(created_at) = CURRENT_DATE
    """).fetchone()
```

---

## ⚡ Performance Benefits

### Speed
- ✅ Faster responses (less tokens to process)
- ✅ Lower latency
- ✅ Better user experience

### Cost
- ✅ 10x fewer tokens
- ✅ Stay within free tier
- ✅ Can handle more queries

### Quality
- ✅ Still maintains conversation flow
- ✅ Recent context is most relevant
- ✅ No quality loss

---

## 🎯 Recommended Settings

```python
# Optimal settings for free tier
SLIDING_WINDOW_SIZE = 3  # Last 3 messages
MAX_CHUNKS = 3  # Top 3 retrieved chunks
TEMPERATURE = 0.1  # Consistent answers
```

**Result: ~1,070 tokens per query ✅**

---

## 📊 Monitoring Dashboard

### Show in UI:
- Today's token usage
- Remaining quota
- Average tokens per query
- Usage trends

### Example:
```
Token Usage Today: 45,230 / 1,000,000
Queries Today: 42
Avg per Query: 1,077 tokens
Status: ✅ Within limits
```

---

## ✅ Implementation Checklist

- [ ] Remove ConversationBufferMemory
- [ ] Add database for messages
- [ ] Implement get_recent_messages()
- [ ] Update query_rag() to use sliding window
- [ ] Add token tracking
- [ ] Test token usage
- [ ] Monitor in production

---

**This strategy will keep you well within free tier limits!** 🎯

