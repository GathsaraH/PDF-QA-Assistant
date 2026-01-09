"""
RAG Engine Module with Pinecone
Production-ready version with persistent vector storage
"""

import os
from typing import Dict, List, Optional
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from langchain_classic.chains import ConversationalRetrievalChain
from langchain_core.documents import Document

from pinecone import Pinecone as PineconeClient, ServerlessSpec

# Database import
from database import get_recent_messages, save_message, track_token_usage, get_db

# Pinecone client (singleton)
pinecone_client = None
pinecone_index = None


def initialize_pinecone():
    """Initialize Pinecone connection"""
    global pinecone_client, pinecone_index
    
    if pinecone_client and pinecone_index:
        return  # Already initialized
    
    api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME", "pdf-rag-demo")
    environment = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")  # Default for serverless
    
    if not api_key:
        raise Exception("PINECONE_API_KEY not found in environment variables")
    
    try:
        # Initialize Pinecone client (v5+)
        pinecone_client = PineconeClient(api_key=api_key)
        
        # Check if index exists
        existing_indexes = [idx.name for idx in pinecone_client.list_indexes()]
        
        if index_name in existing_indexes:
            # Check if index has wrong dimension (1536 from OpenAI)
            # Delete and recreate with correct dimension (768 for Gemini)
            try:
                index_info = pinecone_client.describe_index(index_name)
                if index_info.dimension != 768:
                    print(f"⚠️  Index {index_name} has dimension {index_info.dimension}, but we need 768 (Gemini)")
                    print(f"🗑️  Deleting old index to create new one with correct dimension...")
                    pinecone_client.delete_index(index_name)
                    # Wait for deletion
                    import time
                    time.sleep(3)
                    print(f"✅ Old index deleted")
            except Exception as e:
                print(f"⚠️  Could not check index dimension: {e}")
        
        if index_name not in [idx.name for idx in pinecone_client.list_indexes()]:
            # Create index if it doesn't exist (v6+)
            print(f"📦 Creating new Pinecone index: {index_name} with dimension 768 (Gemini)")
            pinecone_client.create_index(
                name=index_name,
                dimension=768,  # Gemini text-embedding-004 dimension
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region=environment
                )
            )
            print(f"✅ Created Pinecone index: {index_name}")
            # Wait for index to be ready
            import time
            time.sleep(5)
        
        # Get index
        pinecone_index = pinecone_client.Index(index_name)
        print(f"Pinecone initialized with index: {index_name}")
        
    except Exception as e:
        raise Exception(f"Failed to initialize Pinecone: {str(e)}")


def initialize_rag(session_id: str, chunks: List[Dict]) -> None:
    """
    Initialize RAG engine with PDF chunks using Pinecone
    
    Args:
        session_id: Unique session identifier
        chunks: List of chunk dictionaries with content, page, chunk_index
    """
    try:
        # Initialize Pinecone
        initialize_pinecone()
        
        # Convert chunks to LangChain documents
        documents = [
            Document(
                page_content=chunk["content"],
                metadata={
                    "page": chunk["page"],
                    "chunk_index": chunk["chunk_index"],
                    "source": f"Page {chunk['page']}, Chunk {chunk['chunk_index']}",
                    "session_id": session_id,  # Important: filter by session
                }
            )
            for chunk in chunks
        ]
        
        # Create embeddings using Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise Exception("GEMINI_API_KEY not found in environment variables")
        
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=api_key
        )
        
        # Create Pinecone vector store
        vector_store = PineconeVectorStore.from_documents(
            documents,
            embeddings,
            index_name=os.getenv("PINECONE_INDEX_NAME", "pdf-rag-demo"),
            namespace=session_id  # Use sessionId as namespace for isolation
        )
        
        # No longer using ConversationBufferMemory
        # Messages will be stored in database and retrieved as needed
        print(f"RAG engine initialized for session {session_id} with {len(chunks)} chunks in Pinecone")
        
    except Exception as e:
        raise Exception(f"Failed to initialize RAG engine: {str(e)}")


def query_rag(session_id: str, question: str, db = None) -> Dict[str, any]:
    """
    Query RAG system with a question using Pinecone
    Uses sliding window: only last 1 message for context (POC)
    
    Args:
        session_id: Session identifier
        question: User question
        db: Database session
    
    Returns:
        Dictionary with 'answer' and 'sources' keys
    """
    if not db:
        from database import SessionLocal
        db = next(SessionLocal())
    
    try:
        # Check if session is initialized (document exists)
        from database import Document
        document = db.query(Document).filter(Document.session_id == session_id).first()
        if not document:
            raise Exception("RAG engine not initialized. Please upload a PDF first.")
        
        # Initialize Pinecone if not already done
        initialize_pinecone()
        
        # Get last 1 message for context (sliding window - POC)
        recent_messages = get_recent_messages(db, session_id, limit=1)
        
        # Create embeddings using Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise Exception("GEMINI_API_KEY not found in environment variables")
        
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=api_key
        )
        
        # Create Pinecone vector store (for querying)
        vector_store = PineconeVectorStore.from_existing_index(
            index_name=os.getenv("PINECONE_INDEX_NAME", "pdf-rag-demo"),
            embedding=embeddings,
            namespace=session_id
        )
        
        # Create LLM using Gemini
        try:
            llm = ChatGoogleGenerativeAI(
                model="models/gemini-flash-latest",
                google_api_key=api_key,
                temperature=0.1,
                convert_system_message_to_human=True
            )
        except Exception as e:
            # Fallback to gemini-pro-latest if flash doesn't work
            print(f"⚠️  gemini-flash-latest failed, trying gemini-pro-latest: {e}")
            llm = ChatGoogleGenerativeAI(
                model="models/gemini-pro-latest",
                google_api_key=api_key,
                temperature=0.1,
                convert_system_message_to_human=True
            )
        
        # Build chat_history from last message (if exists)
        # OPTIMIZATION: Truncate to max 100 chars to save tokens
        MAX_HISTORY_LENGTH = 100
        chat_history = []
        if recent_messages:
            last_msg = recent_messages[0]
            # Truncate message content to save tokens
            truncated_content = last_msg.content[:MAX_HISTORY_LENGTH]
            if len(last_msg.content) > MAX_HISTORY_LENGTH:
                truncated_content += "..."
            
            # Format: (human_message, ai_message) tuples
            if last_msg.role == "user":
                # Last was user, so no AI response yet - just user message
                chat_history = [(truncated_content, "")]
            elif last_msg.role == "assistant":
                # Last was assistant - we need to get previous user message
                # For POC with only 1 message, we'll use empty user message
                chat_history = [("", truncated_content)]
        
        # OPTIMIZATION: Use k=2 instead of k=3 to reduce tokens (POC requirement)
        # Create retrieval chain (without memory - we handle context manually)
        chain = ConversationalRetrievalChain.from_llm(
            llm,
            vector_store.as_retriever(k=2),  # Reduced from 3 to 2 for token optimization
            return_source_documents=True,
            verbose=False
        )
        
        # Query with chat_history - ConversationalRetrievalChain requires this
        response = chain({
            "question": question,
            "chat_history": chat_history  # List of (human, ai) tuples
        })
        
        # Extract sources (limit to prevent token bloat)
        sources = []
        if "source_documents" in response:
            sources = [
                doc.metadata.get("source", "")[:50]  # Truncate source strings
                for doc in response["source_documents"][:2]  # Only first 2 sources
                if doc.metadata.get("source")
            ]
        
        answer = response.get("answer", "")
        
        # Calculate token usage (better estimation for optimization tracking)
        # Gemini: ~1.3 tokens per word for English
        question_tokens = len(question.split()) * 1.3
        history_tokens = sum(len(msg.content.split()) * 1.3 for msg in recent_messages) if recent_messages else 0
        # Estimate chunks: 2 chunks × ~300 chars = ~150 words = ~200 tokens
        chunk_tokens = 200
        input_tokens = int(question_tokens + history_tokens + chunk_tokens)
        output_tokens = int(len(answer.split()) * 1.3)
        
        # Save messages to database with token counts
        save_message(db, session_id, "user", question, token_count=int(question_tokens))
        save_message(db, session_id, "assistant", answer, sources=sources, token_count=output_tokens)
        
        # Track token usage
        track_token_usage(db, session_id, "gemini-flash-latest", 
                         input_tokens, output_tokens)
        
        return {
            "answer": answer,
            "sources": list(set(sources))  # Remove duplicates
        }
        
    except Exception as e:
        raise Exception(f"Failed to generate answer: {str(e)}")


def clear_session(session_id: str) -> None:
    """
    Clear session data from Pinecone
    """
    try:
        if pinecone_index:
            # Delete all vectors in the namespace
            pinecone_index.delete(delete_all=True, namespace=session_id)
        
        print(f"Session {session_id} cleared from Pinecone")
        
    except Exception as e:
        print(f"Error clearing session: {str(e)}")


def is_session_initialized(session_id: str, db = None) -> bool:
    """
    Check if session is initialized (document exists in DB)
    """
    if not db:
        db_gen = get_db()
        db = next(db_gen)
    
    from database import Document
    document = db.query(Document).filter(Document.session_id == session_id).first()
    return document is not None

