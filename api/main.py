"""
FastAPI Backend for PDF Document Q&A Assistant
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import uvicorn
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from pdf_processor import process_pdf
from rag_engine_pinecone import initialize_rag, query_rag, is_session_initialized, clear_session
from database import get_db, init_db, save_document, get_all_documents, get_chat_history

# Load environment variables
load_dotenv()

app = FastAPI(title="PDF RAG API", version="1.0.0")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    try:
        init_db()
    except Exception as e:
        print(f"⚠️  Database initialization failed: {e}")
        print("💡 App will continue, but database features won't work")
        print("💡 Fix DATABASE_URL in .env and restart")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class ChatRequest(BaseModel):
    question: str
    session_id: str = "default"


class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    success: bool


class UploadResponse(BaseModel):
    success: bool
    message: str
    chunks: int
    session_id: str


@app.get("/")
async def root():
    return {"message": "PDF RAG API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/api/upload", response_model=UploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    session_id: str = Form("default"),
    db: Session = Depends(get_db)
):
    """
    Upload and process PDF file
    """
    try:
        # Validate file type
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

        # Create uploads directory
        uploads_dir = "uploads"
        os.makedirs(uploads_dir, exist_ok=True)

        # Save file
        file_path = os.path.join(uploads_dir, f"{session_id}-{file.filename}")
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Process PDF
        chunks = process_pdf(file_path)

        # Initialize RAG
        initialize_rag(session_id, chunks)

        # Save document to database
        save_document(
            db=db,
            session_id=session_id,
            filename=file.filename or "unknown.pdf",
            file_size=len(content),
            chunk_count=len(chunks)
        )

        return UploadResponse(
            success=True,
            message="PDF processed successfully",
            chunks=len(chunks),
            session_id=session_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Query the RAG system with a question
    Uses sliding window: only last 1 message for context (POC)
    """
    try:
        # Check if session is initialized
        if not is_session_initialized(request.session_id, db):
            raise HTTPException(
                status_code=400,
                detail="Please upload a PDF first"
            )

        # Query RAG (with database session for sliding window)
        result = query_rag(request.session_id, request.question, db)

        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            success=True
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate answer: {str(e)}"
        )


@app.delete("/api/document/{session_id}")
async def delete_document(session_id: str, db: Session = Depends(get_db)):
    """
    Delete a document and all related data (Pinecone vectors, chat history, messages, token usage)
    """
    try:
        from database import Document, ChatSession, Message, TokenUsage
        import os
        
        # Get document
        document = db.query(Document).filter(Document.session_id == session_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete from Pinecone
        try:
            clear_session(session_id)
        except Exception as e:
            print(f"⚠️  Error clearing Pinecone: {e}")
        
        # Delete related chat sessions
        chat_sessions = db.query(ChatSession).filter(ChatSession.document_id == document.id).all()
        for chat_session in chat_sessions:
            # Delete all messages in this chat session
            db.query(Message).filter(Message.chat_session_id == chat_session.id).delete()
            # Delete the chat session
            db.delete(chat_session)
        
        # Delete token usage records
        db.query(TokenUsage).filter(TokenUsage.session_id == session_id).delete()
        
        # Delete the document
        db.delete(document)
        db.commit()
        
        # Delete uploaded file if exists
        try:
            uploads_dir = "uploads"
            file_path = os.path.join(uploads_dir, f"{session_id}-{document.filename}")
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"⚠️  Error deleting file: {e}")
        
        return {"success": True, "message": f"Document {session_id} deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")


@app.get("/api/documents")
async def get_documents(db: Session = Depends(get_db)):
    """
    Get all uploaded documents
    """
    documents = get_all_documents(db)
    return {
        "documents": [
            {
                "id": str(doc.id),
                "session_id": doc.session_id,
                "filename": doc.filename,
                "chunk_count": doc.chunk_count,
                "uploaded_at": doc.uploaded_at.isoformat(),
            }
            for doc in documents
        ]
    }


@app.get("/api/chat-history/{session_id}")
async def get_chat_history_endpoint(session_id: str, db: Session = Depends(get_db)):
    """
    Get chat history for a session
    """
    messages = get_chat_history(db, session_id)
    return {
        "messages": [
            {
                "id": str(msg.id),
                "role": msg.role,
                "content": msg.content,
                "sources": msg.sources,
                "created_at": msg.created_at.isoformat(),
            }
            for msg in messages
        ]
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

