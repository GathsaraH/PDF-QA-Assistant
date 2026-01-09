# 📊 Flowcharts - Complete System Flow

## 🎯 Main User Journey

```mermaid
flowchart TD
    Start([User Opens App]) --> Upload[Upload PDF]
    Upload --> Process[System Processes PDF]
    Process --> Ready[Ready for Questions]
    Ready --> Ask[User Asks Question]
    Ask --> Search[Search Vector Database]
    Search --> Generate[Generate Answer]
    Generate --> Display[Display Answer + Sources]
    Display --> More{More Questions?}
    More -->|Yes| Ask
    More -->|No| End([End])
```

---

## 📤 File Upload Flow

```mermaid
flowchart TD
    Start([User Selects PDF]) --> Validate{File Type<br/>Valid?}
    Validate -->|No| Error1[Show Error:<br/>Only PDF files]
    Validate -->|Yes| CheckSize{File Size<br/>< 10MB?}
    CheckSize -->|No| Error2[Show Error:<br/>File too large]
    CheckSize -->|Yes| CreateForm[Create FormData]
    CreateForm --> AddFile[Add file]
    AddFile --> AddSession[Add session_id]
    AddSession --> Send[POST to Backend]
    Send --> Backend[Backend Processing]
    Backend --> Extract[Extract Text]
    Extract --> Chunk[Split into Chunks]
    Chunk --> Embed[Create Embeddings]
    Embed --> Store[Store in Pinecone]
    Store --> Success[Success Response]
    Success --> ShowSuccess[Show Success Message]
    ShowSuccess --> EnableChat[Enable Chat Interface]
    Error1 --> End([End])
    Error2 --> End
    EnableChat --> End
```

---

## 💬 Chat Flow

```mermaid
flowchart TD
    Start([User Types Question]) --> Check{PDF<br/>Uploaded?}
    Check -->|No| Error[Show: Upload PDF First]
    Check -->|Yes| GetSession[Get session_id]
    GetSession --> CreateBody[Create Request Body]
    CreateBody --> Send[POST /api/chat]
    Send --> Backend[Backend Processing]
    Backend --> GetMemory[Get Chat History]
    GetMemory --> EmbedQuery[Embed Question]
    EmbedQuery --> Search[Search Pinecone<br/>k=3]
    Search --> Retrieve[Retrieve Top 3 Chunks]
    Retrieve --> Combine[Combine Context]
    Combine --> LLM[Call GPT-3.5-turbo]
    LLM --> Answer[Get Answer]
    Answer --> Sources[Extract Sources]
    Sources --> UpdateMemory[Update Memory]
    UpdateMemory --> Response[Return Response]
    Response --> Display[Display Answer]
    Display --> Citations[Show Citations]
    Citations --> AddHistory[Add to History]
    AddHistory --> Clear[Clear Input]
    Error --> End([End])
    Clear --> End
```

---

## 🔄 RAG Pipeline

```mermaid
flowchart LR
    A[PDF Document] --> B[Text Extraction]
    B --> C[Text Chunking]
    C --> D[Embedding Generation]
    D --> E[Vector Storage<br/>Pinecone]
    E --> F[User Question]
    F --> G[Question Embedding]
    G --> H[Similarity Search]
    H --> I[Retrieve Context]
    I --> J[Combine with History]
    J --> K[LLM Generation]
    K --> L[Answer + Sources]
```

---

## 🧠 Memory Management

```mermaid
stateDiagram-v2
    [*] --> NewSession: Upload PDF
    NewSession --> ActiveSession: Initialize Memory
    ActiveSession --> Question1: User asks Q1
    Question1 --> Answer1: Generate A1
    Answer1 --> UpdateMemory: Save Q1+A1
    UpdateMemory --> ActiveSession: Memory Updated
    ActiveSession --> Question2: User asks Q2
    Question2 --> Answer2: Generate A2<br/>(with Q1+A1 context)
    Answer2 --> UpdateMemory: Save Q2+A2
    UpdateMemory --> ActiveSession: Memory Updated
    ActiveSession --> ClearSession: User clears
    ClearSession --> [*]: Memory Deleted
```

---

## 🗄️ Data Storage Flow

```mermaid
graph TB
    A[PDF File] --> B[Text Extraction]
    B --> C[Chunk 1<br/>500 chars]
    B --> D[Chunk 2<br/>500 chars]
    B --> E[Chunk 3<br/>500 chars]
    C --> F[Embedding 1<br/>1536 dims]
    D --> G[Embedding 2<br/>1536 dims]
    E --> H[Embedding 3<br/>1536 dims]
    F --> I[Pinecone<br/>Namespace: session_id]
    G --> I
    H --> I
    I --> J[Vector Database<br/>Persistent Storage]
    
    K[User Question] --> L[Query Embedding<br/>1536 dims]
    L --> M[Similarity Search]
    M --> I
    I --> N[Top 3 Vectors]
    N --> O[Retrieve Chunks]
    O --> P[Context for LLM]
```

---

## 🔍 Query Processing Detail

```mermaid
flowchart TD
    Start([User Question]) --> Embed[Create Query Embedding]
    Embed --> Search[Pinecone Similarity Search]
    Search --> Rank[Rank by Similarity Score]
    Rank --> Top3[Select Top 3 Chunks]
    Top3 --> GetHistory[Get Chat History]
    GetHistory --> Format[Format Prompt]
    Format --> Context[Context:<br/>- Question<br/>- History<br/>- Chunks]
    Context --> LLM[Send to GPT-3.5-turbo]
    LLM --> Parse[Parse Response]
    Parse --> Answer[Extract Answer]
    Parse --> Sources[Extract Sources]
    Answer --> Combine[Combine Answer + Sources]
    Sources --> Combine
    Combine --> Return[Return to Frontend]
    Return --> End([End])
```

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Frontend["🌐 Frontend (Next.js :3000)"]
        A[page.tsx]
        B[FileUpload.tsx]
        C[ChatInterface.tsx]
        D[Citation.tsx]
    end
    
    subgraph Backend["⚙️ Backend (FastAPI :8000)"]
        E[main.py]
        F[pdf_processor.py]
        G[rag_engine_pinecone.py]
    end
    
    subgraph Services["☁️ External Services"]
        H[OpenAI<br/>Embeddings + LLM]
        I[Pinecone<br/>Vector DB]
    end
    
    A --> B
    A --> C
    C --> D
    B -->|POST /api/upload| E
    C -->|POST /api/chat| E
    E --> F
    E --> G
    F --> H
    G --> H
    G --> I
```

---

## 🔐 Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created: Upload PDF
    Created --> Initialized: Store Vectors
    Initialized --> Active: Ready for Questions
    Active --> Q1: Question 1
    Q1 --> A1: Answer 1
    A1 --> Update1: Update Memory
    Update1 --> Active: Continue
    Active --> Q2: Question 2
    Q2 --> A2: Answer 2<br/>(with Q1 context)
    A2 --> Update2: Update Memory
    Update2 --> Active: Continue
    Active --> Clear: User Clears
    Clear --> Deleted: Delete Namespace
    Deleted --> [*]: Session Ended
```

---

## 📊 Error Handling Flow

```mermaid
flowchart TD
    Start([API Request]) --> Try{Try Process}
    Try -->|Success| Success[Return Success]
    Try -->|Error| Catch[Catch Exception]
    Catch --> Check{Error Type?}
    Check -->|Validation| Error400[400 Bad Request]
    Check -->|Not Found| Error404[404 Not Found]
    Check -->|Server| Error500[500 Server Error]
    Check -->|External API| Error503[503 Service Unavailable]
    Error400 --> Log[Log Error]
    Error404 --> Log
    Error500 --> Log
    Error503 --> Log
    Log --> Response[Return Error Response]
    Response --> Frontend[Frontend Shows Error]
    Success --> End([End])
    Frontend --> End
```

---

## 🚀 Deployment Flow

```mermaid
flowchart LR
    A[Local Development] --> B[Test Locally]
    B --> C[Create .env files]
    C --> D[Run Backend]
    D --> E[Run Frontend]
    E --> F[Test Upload]
    F --> G[Test Chat]
    G --> H[Ready for Demo]
    
    style A fill:#e1f5ff
    style H fill:#c8e6c9
```

---

## 📝 Complete Request-Response Cycle

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant PDF as PDF Processor
    participant EMB as OpenAI
    participant PC as Pinecone
    participant LLM as GPT-3.5

    Note over U,LLM: Upload Phase
    U->>FE: Select PDF
    FE->>BE: POST /api/upload
    BE->>PDF: process_pdf()
    PDF->>BE: Return chunks
    BE->>EMB: Create embeddings
    EMB->>PC: Store vectors
    PC->>BE: Confirm
    BE->>FE: Success
    FE->>U: Show success
    
    Note over U,LLM: Query Phase
    U->>FE: Type question
    FE->>BE: POST /api/chat
    BE->>PC: Query vectors
    PC->>BE: Return chunks
    BE->>LLM: Generate answer
    LLM->>BE: Return answer
    BE->>FE: Response
    FE->>U: Display answer
```

---

**All flowcharts show the complete system architecture!** 🎯

