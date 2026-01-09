# 🏗️ Architecture Documentation - PDF Q&A Assistant

## 📊 System Architecture Overview

```mermaid
graph TB
    User[👤 User] -->|1. Upload PDF| Frontend[🌐 Frontend<br/>Next.js :3000]
    Frontend -->|2. POST /api/upload| Backend[⚙️ Backend<br/>FastAPI :8000]
    Backend -->|3. Process PDF| PDFProcessor[📄 PDF Processor]
    PDFProcessor -->|4. Extract Text| Chunks[📦 Text Chunks]
    Backend -->|5. Create Embeddings| OpenAI[🤖 OpenAI<br/>text-embedding-3-small]
    OpenAI -->|6. Store Vectors| Pinecone[🗄️ Pinecone<br/>Vector Database]
    User -->|7. Ask Question| Frontend
    Frontend -->|8. POST /api/chat| Backend
    Backend -->|9. Query Pinecone| Pinecone
    Pinecone -->|10. Retrieve Context| Backend
    Backend -->|11. Generate Answer| LLM[🤖 OpenAI<br/>GPT-3.5-turbo]
    LLM -->|12. Return Answer| Backend
    Backend -->|13. Response with Sources| Frontend
    Frontend -->|14. Display Answer| User
```

---

## 🔄 Complete Flow: File Upload to Answer

### Step 1: User Uploads PDF (Frontend)

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend<br/>(Next.js)
    participant BE as Backend<br/>(FastAPI)
    participant PDF as PDF Processor
    participant EMB as OpenAI Embeddings
    participant PC as Pinecone

    U->>FE: 1. Select PDF file
    U->>FE: 2. Click "Upload"
    FE->>FE: 3. Create FormData with file
    FE->>BE: 4. POST /api/upload<br/>(multipart/form-data)
    
    BE->>BE: 5. Validate file type (PDF)
    BE->>BE: 6. Save file to uploads/
    BE->>PDF: 7. process_pdf(file_path)
    
    PDF->>PDF: 8. Extract text from PDF
    PDF->>PDF: 9. Split into chunks<br/>(500 chars, overlap 50)
    PDF->>BE: 10. Return chunks array
    
    BE->>BE: 11. Generate session_id
    BE->>EMB: 12. Create embeddings<br/>(text-embedding-3-small)
    EMB->>EMB: 13. Convert chunks to vectors
    EMB->>PC: 14. Store vectors in Pinecone<br/>(namespace = session_id)
    
    PC->>BE: 15. Confirm storage
    BE->>BE: 16. Initialize memory<br/>(ConversationBufferMemory)
    BE->>FE: 17. Return success + session_id
    FE->>U: 18. Show "Upload successful"
```

### Step 2: User Asks Question (Frontend → Backend)

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant MEM as Memory
    participant PC as Pinecone
    participant LLM as GPT-3.5-turbo

    U->>FE: 1. Type question
    U->>FE: 2. Click "Send"
    FE->>FE: 3. Get session_id from state
    FE->>BE: 4. POST /api/chat<br/>{question, session_id}
    
    BE->>BE: 5. Validate session exists
    BE->>MEM: 6. Get conversation history
    MEM->>BE: 7. Return chat history
    
    BE->>PC: 8. Query Pinecone<br/>(similarity search, k=3)
    PC->>PC: 9. Find top 3 similar chunks
    PC->>BE: 10. Return relevant chunks
    
    BE->>BE: 11. Combine:<br/>- Question<br/>- Chat history<br/>- Retrieved chunks
    
    BE->>LLM: 12. Send to GPT-3.5-turbo
    LLM->>LLM: 13. Generate answer with context
    LLM->>BE: 14. Return answer + sources
    
    BE->>MEM: 15. Save to memory
    BE->>FE: 16. Return {answer, sources}
    FE->>U: 17. Display answer + citations
```

---

## 🎯 Frontend Flow (Detailed)

### Component Structure

```mermaid
graph LR
    A[page.tsx<br/>Main Page] --> B[FileUpload.tsx]
    A --> C[ChatInterface.tsx]
    C --> D[Citation.tsx]
    
    B -->|Upload PDF| E[API Call<br/>POST /api/upload]
    C -->|Ask Question| F[API Call<br/>POST /api/chat]
    
    E --> G[Backend]
    F --> G
```

### File Upload Component Flow

```mermaid
flowchart TD
    Start([User clicks Upload]) --> Select[Select PDF File]
    Select --> Validate{File Type?}
    Validate -->|Not PDF| Error1[Show Error:<br/>Only PDF files]
    Validate -->|PDF| CreateForm[Create FormData]
    CreateForm --> AddFile[Add file to FormData]
    AddFile --> AddSession[Add session_id]
    AddSession --> Post[POST /api/upload]
    Post --> Wait[Show Loading]
    Wait --> Response{Response?}
    Response -->|Error| Error2[Show Error Message]
    Response -->|Success| Success[Show Success:<br/>PDF processed]
    Success --> EnableChat[Enable Chat Interface]
    Error1 --> End([End])
    Error2 --> End
    EnableChat --> End
```

### Chat Interface Flow

```mermaid
flowchart TD
    Start([User types question]) --> Validate{PDF Uploaded?}
    Validate -->|No| ShowError[Show: Upload PDF first]
    Validate -->|Yes| GetSession[Get session_id]
    GetSession --> CreateRequest[Create request body]
    CreateRequest --> Post[POST /api/chat]
    Post --> ShowLoading[Show Loading Spinner]
    ShowLoading --> Response{Response?}
    Response -->|Error| Error[Show Error]
    Response -->|Success| Display[Display Answer]
    Display --> ShowSources[Show Citations]
    ShowSources --> AddToHistory[Add to Chat History]
    AddToHistory --> ClearInput[Clear Input Field]
    ShowError --> End([End])
    Error --> End
    ClearInput --> End
```

---

## ⚙️ Backend Flow (Detailed)

### Upload Endpoint Flow

```mermaid
flowchart TD
    Start([POST /api/upload]) --> ValidateType{Content-Type<br/>application/pdf?}
    ValidateType -->|No| Error1[400: Only PDF files]
    ValidateType -->|Yes| SaveFile[Save file to uploads/]
    SaveFile --> ProcessPDF[process_pdf]
    ProcessPDF --> Extract[Extract text from PDF]
    Extract --> Chunk[Split into chunks<br/>500 chars, 50 overlap]
    Chunk --> GetSession[Get/Create session_id]
    GetSession --> InitializeRAG[initialize_rag]
    InitializeRAG --> CreateEmbeddings[Create embeddings]
    CreateEmbeddings --> StorePinecone[Store in Pinecone<br/>namespace=session_id]
    StorePinecone --> CreateMemory[Create ConversationBufferMemory]
    CreateMemory --> Success[200: Success response]
    Error1 --> End([End])
    Success --> End
```

### Chat Endpoint Flow

```mermaid
flowchart TD
    Start([POST /api/chat]) --> ValidateSession{Session<br/>Initialized?}
    ValidateSession -->|No| Error1[400: Upload PDF first]
    ValidateSession -->|Yes| GetMemory[Get ConversationBufferMemory]
    GetMemory --> GetQuestion[Extract question]
    GetQuestion --> CreateEmbeddings[Create query embedding]
    CreateEmbeddings --> QueryPinecone[Query Pinecone<br/>similarity search, k=3]
    QueryPinecone --> GetChunks[Get top 3 chunks]
    GetChunks --> GetHistory[Get chat history]
    GetHistory --> Combine[Combine:<br/>Question + History + Chunks]
    Combine --> CallLLM[Call GPT-3.5-turbo]
    CallLLM --> GetAnswer[Get answer + sources]
    GetAnswer --> UpdateMemory[Update memory]
    UpdateMemory --> Return[200: Return answer + sources]
    Error1 --> End([End])
    Return --> End
```

---

## 📦 Data Flow

### PDF Processing Pipeline

```mermaid
graph LR
    A[PDF File] --> B[pdfplumber<br/>Extract Text]
    B --> C[Text String]
    C --> D[Split into Chunks<br/>500 chars]
    D --> E[Chunk 1<br/>Page 1]
    D --> F[Chunk 2<br/>Page 1]
    D --> G[Chunk 3<br/>Page 2]
    E --> H[OpenAI Embeddings]
    F --> H
    G --> H
    H --> I[Vector 1<br/>1536 dims]
    H --> J[Vector 2<br/>1536 dims]
    H --> K[Vector 3<br/>1536 dims]
    I --> L[Pinecone<br/>Namespace: session_id]
    J --> L
    K --> L
```

### RAG Query Pipeline

```mermaid
graph LR
    A[User Question] --> B[OpenAI Embedding]
    B --> C[Query Vector<br/>1536 dims]
    C --> D[Pinecone<br/>Similarity Search]
    D --> E[Top 3 Chunks]
    E --> F[Context + History]
    F --> G[GPT-3.5-turbo]
    G --> H[Answer + Sources]
```

---

## 🔑 Key Components

### Frontend Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `FileUpload.tsx` | PDF upload UI | Drag & drop, file validation, progress |
| `ChatInterface.tsx` | Chat UI | Message display, input, loading states |
| `Citation.tsx` | Source citations | Display page numbers, chunk references |

### Backend Modules

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| `main.py` | FastAPI app | API endpoints, CORS, routing |
| `pdf_processor.py` | PDF processing | Extract text, chunk documents |
| `rag_engine_pinecone.py` | RAG logic | Initialize RAG, query RAG, manage sessions |

### External Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| OpenAI | Embeddings & LLM | `text-embedding-3-small`, `gpt-3.5-turbo` |
| Pinecone | Vector Database | Serverless, AWS, namespace isolation |

---

## 📝 Session Management

```mermaid
graph TB
    A[New Session] --> B[Generate session_id<br/>UUID or timestamp]
    B --> C[Upload PDF]
    C --> D[Store vectors in<br/>Pinecone namespace]
    D --> E[Create memory object]
    E --> F[Session Active]
    F --> G[User asks questions]
    G --> H[Update memory]
    H --> F
    F --> I[User clears session]
    I --> J[Delete Pinecone namespace]
    J --> K[Delete memory object]
    K --> L[Session Cleared]
```

---

## 🔐 Environment Variables

### Frontend (`web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`api/.env`)
```env
OPENAI_API_KEY=your_key
PINECONE_API_KEY=your_key
PINECONE_INDEX_NAME=pdf-rag-demo
PINECONE_ENVIRONMENT=us-east-1
```

---

## 🚀 API Endpoints

### POST `/api/upload`
- **Input**: `multipart/form-data` with PDF file
- **Output**: `{success: true, message: "...", chunks: 10, session_id: "..."}`
- **Process**: Extract → Chunk → Embed → Store

### POST `/api/chat`
- **Input**: `{question: "...", session_id: "..."}`
- **Output**: `{answer: "...", sources: ["Page 1, Chunk 1"], success: true}`
- **Process**: Query → Retrieve → Generate → Return

### DELETE `/api/session/{session_id}`
- **Input**: session_id in URL
- **Output**: `{success: true, message: "..."}`
- **Process**: Delete namespace → Clear memory

---

**This architecture supports scalable, production-ready RAG system!** 🎯

