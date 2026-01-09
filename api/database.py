"""
Database setup and connection for PostgreSQL
"""

import os
from sqlalchemy import create_engine, Column, String, Integer, BigInteger, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from typing import Optional

# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/pdf_rag_db"
)

# Fix connection string - remove invalid parameters
def fix_database_url(url: str) -> str:
    """Fix database URL by removing invalid parameters like 'schema'"""
    if not url:
        return url
    
    # Remove schema parameter if present (not supported by psycopg2)
    if '?' in url:
        base_url, params = url.split('?', 1)
        # Filter out schema parameter (case-insensitive)
        param_list = params.split('&')
        valid_params = [
            p for p in param_list 
            if p and not p.lower().startswith('schema=')
        ]
        if valid_params:
            return f"{base_url}?{'&'.join(valid_params)}"
        return base_url
    return url

# Create engine with fixed URL
try:
    fixed_url = fix_database_url(DATABASE_URL)
    print(f"🔗 Connecting to database...")
    print(f"📝 URL: {fixed_url[:50]}..." if len(fixed_url) > 50 else f"📝 URL: {fixed_url}")
    engine = create_engine(fixed_url, pool_pre_ping=True, echo=False)
except Exception as e:
    print(f"⚠️  Database connection error: {e}")
    print("💡 Check your DATABASE_URL in .env file")
    print("💡 Make sure it doesn't contain 'schema=' parameter")
    print("💡 Format: postgresql://user:password@host:5432/database")
    engine = None

# Create session factory (only if engine exists)
if engine:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    # Dummy sessionmaker if no engine
    SessionLocal = None

# Base class for models
Base = declarative_base()


# Models
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(255), unique=True, nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_size = Column(BigInteger)
    chunk_count = Column(Integer)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="active")


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    session_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_session_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    sources = Column(JSON)  # Array of source citations
    token_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class TokenUsage(Base):
    __tablename__ = "token_usage"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(255), nullable=False, index=True)
    model = Column(String(100))
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


# Database dependency
def get_db():
    """Get database session"""
    if not SessionLocal:
        raise Exception("Database not configured. Please set DATABASE_URL in .env")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Initialize database
def init_db():
    """Create all tables"""
    if not engine:
        print("⚠️  Database engine not initialized. Check DATABASE_URL in .env")
        return
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created")
    except Exception as e:
        print(f"⚠️  Database initialization error: {e}")
        print("💡 Make sure DATABASE_URL is correct in .env file")
        print("💡 Format: postgresql://user:password@host:5432/database")
        print("💡 Remove any 'schema=' parameter from the URL")
        # Don't raise - allow app to start even if DB fails


# Helper functions
def get_recent_messages(db: Session, session_id: str, limit: int = 1) -> list:
    """Get last N messages for context (sliding window - POC: last 1 message)"""
    try:
        # Get chat_session_id from document session_id
        document = db.query(Document).filter(Document.session_id == session_id).first()
        if not document:
            return []
        
        chat_session = db.query(ChatSession).filter(
            ChatSession.document_id == document.id
        ).first()
        
        if not chat_session:
            return []
        
        messages = db.query(Message).filter(
            Message.chat_session_id == chat_session.id
        ).order_by(Message.created_at.desc()).limit(limit).all()
        
        # Return in chronological order (oldest first)
        return list(reversed(messages))
    except Exception as e:
        print(f"Error getting recent messages: {e}")
        return []


def save_message(db: Session, session_id: str, role: str, content: str, sources: Optional[list] = None, token_count: int = 0):
    """Save message to database"""
    # Get or create document
    document = db.query(Document).filter(Document.session_id == session_id).first()
    if not document:
        return None
    
    # Get or create chat session
    chat_session = db.query(ChatSession).filter(
        ChatSession.document_id == document.id
    ).first()
    
    if not chat_session:
        chat_session = ChatSession(
            document_id=document.id,
            session_name=document.filename
        )
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)
    
    # Create message
    message = Message(
        chat_session_id=chat_session.id,
        role=role,
        content=content,
        sources=sources,
        token_count=token_count
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def save_document(db: Session, session_id: str, filename: str, file_size: int, chunk_count: int):
    """Save document to database"""
    document = Document(
        session_id=session_id,
        filename=filename,
        file_size=file_size,
        chunk_count=chunk_count
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def track_token_usage(db: Session, session_id: str, model: str, input_tokens: int, output_tokens: int):
    """Track token usage"""
    usage = TokenUsage(
        session_id=session_id,
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=input_tokens + output_tokens
    )
    db.add(usage)
    db.commit()
    return usage


def get_all_documents(db: Session):
    """Get all documents"""
    return db.query(Document).order_by(Document.uploaded_at.desc()).all()


def get_chat_history(db: Session, session_id: str):
    """Get all messages for a session"""
    document = db.query(Document).filter(Document.session_id == session_id).first()
    if not document:
        return []
    
    chat_session = db.query(ChatSession).filter(
        ChatSession.document_id == document.id
    ).first()
    
    if not chat_session:
        return []
    
    return db.query(Message).filter(
        Message.chat_session_id == chat_session.id
    ).order_by(Message.created_at.asc()).all()

