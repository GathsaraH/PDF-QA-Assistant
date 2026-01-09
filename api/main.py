"""
FastAPI Backend for PDF Document Q&A Assistant
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import uvicorn
import os
from dotenv import load_dotenv

from pdf_processor import process_pdf
from rag_engine_pinecone import initialize_rag, query_rag, is_session_initialized, clear_session

# Load environment variables
load_dotenv()

app = FastAPI(title="PDF RAG API", version="1.0.0")

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
    session_id: str = Form("default")
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

        return UploadResponse(
            success=True,
            message="PDF processed successfully",
            chunks=len(chunks),
            session_id=session_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Query the RAG system with a question
    """
    try:
        # Check if session is initialized
        if not is_session_initialized(request.session_id):
            raise HTTPException(
                status_code=400,
                detail="Please upload a PDF first"
            )

        # Query RAG
        result = query_rag(request.session_id, request.question)

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


@app.delete("/api/session/{session_id}")
async def delete_session(session_id: str):
    """
    Clear a session
    """
    clear_session(session_id)
    return {"success": True, "message": f"Session {session_id} cleared"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

