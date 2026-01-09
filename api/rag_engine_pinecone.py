"""
RAG Engine Module with Pinecone
Production-ready version with persistent vector storage
"""

import os
from typing import Dict, List
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from langchain_classic.chains import ConversationalRetrievalChain
from langchain_classic.memory import ConversationBufferMemory
from langchain_core.documents import Document

from pinecone import Pinecone as PineconeClient, ServerlessSpec

# In-memory storage for memories (Pinecone handles vector storage)
memories: Dict[str, ConversationBufferMemory] = {}

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
        
        # Initialize memory
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"
        )
        memories[session_id] = memory
        
        print(f"RAG engine initialized for session {session_id} with {len(chunks)} chunks in Pinecone")
        
    except Exception as e:
        raise Exception(f"Failed to initialize RAG engine: {str(e)}")


def query_rag(session_id: str, question: str) -> Dict[str, any]:
    """
    Query RAG system with a question using Pinecone
    
    Args:
        session_id: Session identifier
        question: User question
    
    Returns:
        Dictionary with 'answer' and 'sources' keys
    """
    if session_id not in memories:
        raise Exception("RAG engine not initialized. Please upload a PDF first.")
    
    try:
        # Initialize Pinecone if not already done
        initialize_pinecone()
        
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
        
        memory = memories[session_id]
        
        # Create LLM using Gemini
        # Use gemini-1.5-flash (available on free tier)
        llm = ChatGoogleGenerativeAI(
            model="models/gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.1,
            convert_system_message_to_human=True
        )
        
        # Create retrieval chain
        chain = ConversationalRetrievalChain.from_llm(
            llm,
            vector_store.as_retriever(k=3),  # Retrieve top 3 chunks
            memory=memory,
            return_source_documents=True,
            verbose=False
        )
        
        # Query
        response = chain({"question": question})
        
        # Extract sources
        sources = []
        if "source_documents" in response:
            sources = [
                doc.metadata.get("source", "")
                for doc in response["source_documents"]
                if doc.metadata.get("source")
            ]
        
        return {
            "answer": response.get("answer", ""),
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
        
        if session_id in memories:
            del memories[session_id]
        
        print(f"Session {session_id} cleared from Pinecone")
        
    except Exception as e:
        print(f"Error clearing session: {str(e)}")


def is_session_initialized(session_id: str) -> bool:
    """
    Check if session is initialized
    """
    return session_id in memories

